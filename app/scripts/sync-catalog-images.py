#!/usr/bin/env python3
"""Fetch and verify the dealer photographs declared in catalog-images.json."""

from __future__ import annotations

import concurrent.futures
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import struct
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass

from PIL import Image, ImageOps


APP_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = APP_ROOT / "public" / "assets" / "catalog"
MANIFEST_PATH = APP_ROOT / "catalog-images.json"
ALLOWED_HOST = "opensooq-imagesv2.os-cdn.com"
MAX_IMAGE_BYTES = 20 * 1024 * 1024
MAX_SOURCE_BYTES = 64 * 1024 * 1024
MAX_MANIFEST_BYTES = 4 * 1024 * 1024
WORKERS = 4
ATTEMPTS = 3


class CatalogSyncError(Exception):
    pass


@dataclass(frozen=True)
class CatalogImage:
    image_id: str
    path: str
    target: Path
    url: str
    sha256: str
    width: int
    height: int
    byte_count: int
    source_sha256: str | None = None
    source_width: int | None = None
    source_height: int | None = None
    source_byte_count: int | None = None
    conversion: dict[str, int] | None = None


def validate_url(url: object) -> str:
    if not isinstance(url, str) or any(ord(char) < 32 for char in url):
        raise CatalogSyncError("Photo URL must be an HTTPS URL")
    try:
        parsed = urllib.parse.urlsplit(url)
        port = parsed.port
    except ValueError as error:
        raise CatalogSyncError("Photo URL is malformed") from error
    if (
        parsed.scheme != "https"
        or parsed.hostname != ALLOWED_HOST
        or parsed.username is not None
        or parsed.password is not None
        or port not in (None, 443)
        or parsed.fragment
        or not parsed.path.startswith("/")
    ):
        raise CatalogSyncError("Photo URL must use the approved OpenSooq image host")
    return url


class SameHostRedirectHandler(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        validate_url(new_url)
        return super().redirect_request(request, response, code, message, headers, new_url)


def positive_integer(value: object, label: str, maximum: int) -> int:
    if type(value) is not int or value < 1 or value > maximum:
        raise CatalogSyncError(f"Invalid {label} in catalogue image manifest")
    return value


def validate_target(value: object) -> tuple[str, Path]:
    if not isinstance(value, str) or "\\" in value:
        raise CatalogSyncError("Invalid catalogue photo path")
    path = PurePosixPath(value)
    if (
        path.is_absolute()
        or ".." in path.parts
        or len(path.parts) != 4
        or path.parts[:3] != ("public", "assets", "catalog")
        or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*\.(?:webp|jpg|jpeg|png)", path.name)
    ):
        raise CatalogSyncError("Photo path must be a WebP, JPEG or PNG file under public/assets/catalog")
    target = APP_ROOT.joinpath(*path.parts)
    if not target.resolve().is_relative_to(ASSET_ROOT.resolve()):
        raise CatalogSyncError("Catalogue photo path leaves the asset directory")
    for item in (APP_ROOT / "public", APP_ROOT / "public" / "assets", ASSET_ROOT, target):
        if item.is_symlink():
            raise CatalogSyncError("Catalogue photo paths cannot contain symbolic links")
    return path.as_posix(), target


def read_manifest() -> list[CatalogImage]:
    if not MANIFEST_PATH.is_file():
        raise CatalogSyncError("Missing app/catalog-images.json")
    if MANIFEST_PATH.stat().st_size > MAX_MANIFEST_BYTES:
        raise CatalogSyncError("Catalogue image manifest is too large")
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (UnicodeError, json.JSONDecodeError) as error:
        raise CatalogSyncError("Catalogue image manifest is not valid UTF-8 JSON") from error
    images = manifest.get("images") if isinstance(manifest, dict) else None
    if not isinstance(images, list) or not images or len(images) > 10000:
        raise CatalogSyncError("Catalogue image manifest must contain a non-empty images list")
    result: list[CatalogImage] = []
    seen_paths: set[str] = set()
    for entry in images:
        if not isinstance(entry, dict):
            raise CatalogSyncError("Invalid catalogue image entry")
        image_id = entry.get("id")
        if not isinstance(image_id, (str, int)) or isinstance(image_id, bool) or not str(image_id).strip():
            raise CatalogSyncError("Catalogue image entries need an id")
        path, target = validate_target(entry.get("path"))
        if path in seen_paths:
            raise CatalogSyncError(f"Duplicate catalogue photo path: {path}")
        seen_paths.add(path)
        digest = entry.get("sha256")
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", digest):
            raise CatalogSyncError(f"Invalid photo SHA-256: {path}")
        conversion = entry.get("conversion")
        source_digest = None
        source_width = source_height = source_byte_count = None
        if conversion is not None:
            if (
                not isinstance(conversion, dict)
                or set(conversion) != {"maxEdge", "quality", "method"}
                or any(type(value) is not int for value in conversion.values())
                or conversion != {"maxEdge": 1600, "quality": 88, "method": 4}
                or PurePosixPath(path).suffix != ".webp"
            ):
                raise CatalogSyncError(f"Unsupported catalogue photo conversion: {path}")
            source_digest = entry.get("sourceSha256")
            if not isinstance(source_digest, str) or not re.fullmatch(r"[0-9a-fA-F]{64}", source_digest):
                raise CatalogSyncError(f"Invalid source photo SHA-256: {path}")
            source_digest = source_digest.lower()
            source_width = positive_integer(entry.get("sourceWidth"), "source photo width", 20000)
            source_height = positive_integer(entry.get("sourceHeight"), "source photo height", 20000)
            source_byte_count = positive_integer(entry.get("sourceBytes"), "source photo byte count", MAX_SOURCE_BYTES)
            source_url = validate_url(entry.get("sourceUrl"))
        else:
            source_url = validate_url(entry.get("url"))
        result.append(CatalogImage(
            image_id=str(image_id),
            path=path,
            target=target,
            url=source_url,
            sha256=digest.lower(),
            width=positive_integer(entry.get("width"), "photo width", 20000),
            height=positive_integer(entry.get("height"), "photo height", 20000),
            byte_count=positive_integer(entry.get("bytes"), "photo byte count", MAX_IMAGE_BYTES),
            source_sha256=source_digest,
            source_width=source_width,
            source_height=source_height,
            source_byte_count=source_byte_count,
            conversion=conversion,
        ))
    return result


def webp_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 20 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise CatalogSyncError("Downloaded photo is not a WebP file")
    if struct.unpack_from("<I", data, 4)[0] + 8 != len(data):
        raise CatalogSyncError("Downloaded WebP has an invalid RIFF size")
    offset = 12
    while offset + 8 <= len(data):
        kind = data[offset:offset + 4]
        size = struct.unpack_from("<I", data, offset + 4)[0]
        start = offset + 8
        end = start + size
        if end > len(data):
            raise CatalogSyncError("Downloaded WebP contains an incomplete chunk")
        if kind == b"VP8X" and size >= 10:
            return int.from_bytes(data[start + 4:start + 7], "little") + 1, int.from_bytes(data[start + 7:start + 10], "little") + 1
        if kind == b"VP8L" and size >= 5 and data[start] == 0x2F:
            bits = struct.unpack_from("<I", data, start + 1)[0]
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        if kind == b"VP8 " and size >= 10 and data[start + 3:start + 6] == b"\x9d\x01\x2a":
            return struct.unpack_from("<H", data, start + 6)[0] & 0x3FFF, struct.unpack_from("<H", data, start + 8)[0] & 0x3FFF
        offset = end + (size & 1)
    raise CatalogSyncError("Downloaded WebP has no supported image header")


def jpeg_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 4 or data[:2] != b"\xff\xd8" or data[-2:] != b"\xff\xd9":
        raise CatalogSyncError("Downloaded photo is not a complete JPEG file")
    offset = 2
    frame_markers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while offset < len(data):
        if data[offset] != 0xFF:
            raise CatalogSyncError("Downloaded JPEG has an invalid marker")
        while offset < len(data) and data[offset] == 0xFF:
            offset += 1
        if offset >= len(data):
            break
        marker = data[offset]
        offset += 1
        if marker in (0x00, 0xDA, 0xD9):
            break
        if marker == 0x01 or 0xD0 <= marker <= 0xD8:
            continue
        if offset + 2 > len(data):
            break
        size = struct.unpack_from(">H", data, offset)[0]
        if size < 2 or offset + size > len(data):
            raise CatalogSyncError("Downloaded JPEG contains an incomplete segment")
        if marker in frame_markers:
            if size < 8:
                raise CatalogSyncError("Downloaded JPEG has an invalid frame header")
            height, width = struct.unpack_from(">HH", data, offset + 3)
            return width, height
        offset += size
    raise CatalogSyncError("Downloaded JPEG has no supported image header")


def png_dimensions(data: bytes) -> tuple[int, int]:
    if (
        len(data) < 45
        or data[:8] != b"\x89PNG\r\n\x1a\n"
        or data[8:16] != b"\x00\x00\x00\x0dIHDR"
        or data[-12:] != b"\x00\x00\x00\x00IEND\xaeB`\x82"
    ):
        raise CatalogSyncError("Downloaded photo is not a complete PNG file")
    return struct.unpack_from(">II", data, 16)


def image_dimensions(data: bytes, path: str) -> tuple[int, int]:
    extension = PurePosixPath(path).suffix
    if extension in (".jpg", ".jpeg"):
        return jpeg_dimensions(data)
    if extension == ".png":
        return png_dimensions(data)
    if extension == ".webp":
        return webp_dimensions(data)
    raise CatalogSyncError("Unsupported catalogue photo format")


def verify_bytes(image: CatalogImage, data: bytes) -> None:
    if len(data) != image.byte_count:
        raise CatalogSyncError("Photo byte count differs from the manifest")
    if hashlib.sha256(data).hexdigest() != image.sha256:
        raise CatalogSyncError("Photo SHA-256 differs from the manifest")
    if image_dimensions(data, image.path) != (image.width, image.height):
        raise CatalogSyncError("Photo dimensions differ from the manifest")


def optimize_source(image: CatalogImage, data: bytes) -> bytes:
    """Verify original bytes, then reproduce the manifest's exact WebP recipe.

    Source containers are decoded in memory and are never written to disk.
    Source dimensions describe the stored pixels before EXIF orientation.
    """
    if image.conversion is None:
        return data
    if len(data) != image.source_byte_count:
        raise CatalogSyncError("Source photo byte count differs from the manifest")
    if hashlib.sha256(data).hexdigest() != image.source_sha256:
        raise CatalogSyncError("Source photo SHA-256 differs from the manifest")
    extension = PurePosixPath(urllib.parse.urlsplit(image.url).path).suffix.lower()
    expected_formats = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".webp": "WEBP"}
    expected_format = expected_formats.get(extension)
    signatures = {
        "JPEG": data.startswith(b"\xff\xd8\xff"),
        "PNG": data.startswith(b"\x89PNG\r\n\x1a\n"),
        "WEBP": len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP",
    }
    if expected_format is None or not signatures[expected_format]:
        raise CatalogSyncError("Source photo type does not match its original URL")
    with Image.open(io.BytesIO(data)) as source:
        if source.format != expected_format:
            raise CatalogSyncError("Source photo decoder type differs from its URL")
        if source.size != (image.source_width, image.source_height):
            raise CatalogSyncError("Source photo dimensions differ from the manifest")
        oriented = ImageOps.exif_transpose(source)
        converted = oriented.convert("RGBA" if "A" in oriented.getbands() else "RGB")
        try:
            converted.thumbnail(
                (image.conversion["maxEdge"], image.conversion["maxEdge"]),
                Image.Resampling.LANCZOS,
            )
            output = io.BytesIO()
            converted.save(
                output,
                format="WEBP",
                quality=image.conversion["quality"],
                method=image.conversion["method"],
            )
            return output.getvalue()
        finally:
            converted.close()
            if oriented is not source:
                oriented.close()


def existing_matches(image: CatalogImage) -> bool:
    if not image.target.is_file() or image.target.stat().st_size != image.byte_count:
        return False
    try:
        verify_bytes(image, image.target.read_bytes())
    except CatalogSyncError:
        return False
    return True


def fetch_image(image: CatalogImage) -> bool:
    if existing_matches(image):
        return False
    opener = urllib.request.build_opener(SameHostRedirectHandler())
    request = urllib.request.Request(image.url, headers={"User-Agent": "Mozilla/5.0", "Accept": "image/jpeg,image/png,image/webp"})
    error: Exception | None = None
    for attempt in range(ATTEMPTS):
        try:
            with opener.open(request, timeout=30) as response:
                validate_url(response.geturl())
                expected_bytes = image.source_byte_count if image.conversion is not None else image.byte_count
                if expected_bytes is None:
                    raise CatalogSyncError("Missing source byte limit")
                data = response.read(expected_bytes + 1)
            data = optimize_source(image, data)
            verify_bytes(image, data)
            image.target.parent.mkdir(parents=True, exist_ok=True)
            temporary: str | None = None
            try:
                with tempfile.NamedTemporaryFile(dir=image.target.parent, prefix="." + image.target.name + ".", suffix=".tmp", delete=False) as output:
                    temporary = output.name
                    output.write(data)
                os.replace(temporary, image.target)
                temporary = None
            finally:
                if temporary is not None:
                    Path(temporary).unlink(missing_ok=True)
            return True
        except (OSError, ValueError, CatalogSyncError, urllib.error.URLError, Image.DecompressionBombError) as caught:
            error = caught
            if attempt < ATTEMPTS - 1:
                time.sleep(2 ** attempt)
    detail = str(error) if isinstance(error, CatalogSyncError) else type(error).__name__
    raise CatalogSyncError(f"{image.path}: {detail}") from error


def main() -> int:
    try:
        images = read_manifest()
        downloaded = 0
        errors: list[str] = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
            futures = {pool.submit(fetch_image, image): image for image in images}
            for future in concurrent.futures.as_completed(futures):
                try:
                    downloaded += int(future.result())
                except CatalogSyncError as error:
                    errors.append(str(error))
        if errors:
            for error in errors:
                print("ERROR: " + error, file=sys.stderr)
            print(f"Catalogue photo sync failed for {len(errors)} of {len(images)} images.", file=sys.stderr)
            return 1
        print(f"Verified {len(images)} catalogue photographs: {downloaded} fetched, {len(images) - downloaded} already present.")
        return 0
    except (OSError, CatalogSyncError) as error:
        print("ERROR: " + str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
