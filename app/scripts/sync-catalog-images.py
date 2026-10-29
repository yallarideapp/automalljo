#!/usr/bin/env python3
"""Fetch and verify the dealer photographs declared in catalog-images.json."""

from __future__ import annotations

import concurrent.futures
import hashlib
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


APP_ROOT = Path(__file__).resolve().parents[1]
ASSET_ROOT = APP_ROOT / "public" / "assets" / "catalog"
MANIFEST_PATH = APP_ROOT / "catalog-images.json"
ALLOWED_HOST = "opensooq-imagesv2.os-cdn.com"
MAX_IMAGE_BYTES = 20 * 1024 * 1024
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
        or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*\.webp", path.name)
    ):
        raise CatalogSyncError("Photo path must be a WebP file under public/assets/catalog")
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
        result.append(CatalogImage(
            image_id=str(image_id),
            path=path,
            target=target,
            url=validate_url(entry.get("url")),
            sha256=digest.lower(),
            width=positive_integer(entry.get("width"), "photo width", 20000),
            height=positive_integer(entry.get("height"), "photo height", 20000),
            byte_count=positive_integer(entry.get("bytes"), "photo byte count", MAX_IMAGE_BYTES),
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


def verify_bytes(image: CatalogImage, data: bytes) -> None:
    if len(data) != image.byte_count:
        raise CatalogSyncError("Photo byte count differs from the manifest")
    if hashlib.sha256(data).hexdigest() != image.sha256:
        raise CatalogSyncError("Photo SHA-256 differs from the manifest")
    if webp_dimensions(data) != (image.width, image.height):
        raise CatalogSyncError("Photo dimensions differ from the manifest")


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
    request = urllib.request.Request(image.url, headers={"User-Agent": "Mozilla/5.0", "Accept": "image/webp"})
    error: Exception | None = None
    for attempt in range(ATTEMPTS):
        try:
            with opener.open(request, timeout=30) as response:
                validate_url(response.geturl())
                data = response.read(image.byte_count + 1)
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
        except (OSError, ValueError, CatalogSyncError, urllib.error.URLError) as caught:
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
