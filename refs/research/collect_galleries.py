#!/usr/bin/env python3
"""Audit the listing-owned image arrays in public OpenSooq detail HTML.

No browser session, private API, image mutation or guessed preview variation is
used. React Server Component payloads are parsed as JSON data, never executed.
Original photo URLs resolve the observed gallery media URI at its CDN origin.
"""
import argparse
import concurrent.futures
import datetime
import json
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "opensooq-active-listings.json"
DESTINATION = HERE / "gallery-audit.json"
CDN_ORIGIN = "https://opensooq-imagesv2.os-cdn.com/"
OWNER_ID = 41155674
DECODER = json.JSONDecoder()


def flight_data(html):
    """Decode only the JSON argument of Next's inert Flight data scripts."""
    chunks = []
    for match in re.finditer(r"<script\b[^>]*>(.*?)</script>", html, re.S):
        script = match.group(1).strip()
        prefix = "self.__next_f.push("
        if not script.startswith(prefix):
            continue
        argument = script[len(prefix):]
        # JSONDecoder stops before the closing JavaScript parenthesis.
        try:
            row, _ = DECODER.raw_decode(argument)
        except json.JSONDecodeError:
            continue
        if isinstance(row, list) and len(row) > 1 and row[0] == 1 and isinstance(row[1], str):
            chunks.append(row[1])
    if not chunks:
        raise ValueError("No public React Server Component data found")
    return "".join(chunks)


def own_listing_data(rsc, listing_id):
    for match in re.finditer(r'"listingData"\s*:\s*', rsc):
        try:
            data, _ = DECODER.raw_decode(rsc[match.end():])
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        info = data.get("commonInfo")
        if not isinstance(info, dict) or str(info.get("postId")) != listing_id:
            continue
        gallery = info.get("gallery")
        owner = info.get("ownerData")
        if not isinstance(gallery, dict) or not isinstance(gallery.get("media"), list):
            continue
        if not isinstance(owner, dict) or owner.get("id") != OWNER_ID:
            raise ValueError("Listing owner did not match AutoMall business 41155674")
        return data
    raise ValueError("No gallery-bearing listingData object matched the requested post ID")


def collect(listing):
    listing_id = str(listing["id"])
    source_url = listing["sourceURL"]
    checked = datetime.datetime.now(ZoneInfo("Asia/Amman")).isoformat(timespec="seconds")
    base = {"id": listing_id, "sourceURL": source_url, "checkedAt": checked}
    for attempt in range(3):
        try:
            request = urllib.request.Request(source_url, headers={
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html,application/xhtml+xml",
            })
            with urllib.request.urlopen(request, timeout=35) as response:
                status = response.status
                html = response.read().decode("utf-8")
                final_url = response.url
            data = own_listing_data(flight_data(html), listing_id)
            info = data["commonInfo"]
            gallery = info["gallery"]
            owner = info["ownerData"]
            chips = gallery.get("chips", {})
            photos = []
            non_images = []
            seen = set()
            for index, media in enumerate(gallery["media"]):
                if not isinstance(media, dict):
                    raise ValueError("Unexpected gallery media reference instead of an object")
                uri = media.get("uri")
                mime_type = media.get("mimeType", "")
                if not isinstance(uri, str) or not uri:
                    non_images.append({"id": media.get("id"), "mimeType": mime_type, "reason": "no URI"})
                    continue
                if not mime_type.startswith("image/"):
                    non_images.append({"id": media.get("id"), "mimeType": mime_type, "uri": uri})
                    continue
                url = urllib.parse.urljoin(CDN_ORIGIN, uri)
                parsed = urllib.parse.urlparse(url)
                if parsed.scheme != "https" or parsed.hostname != "opensooq-imagesv2.os-cdn.com":
                    raise ValueError("Gallery image resolved outside its observed CDN origin")
                if url in seen:
                    raise ValueError("Duplicate photo URI in the official gallery array")
                seen.add(url)
                photos.append({
                    "url": url,
                    "uri": uri,
                    "mimeType": mime_type,
                    "id": media.get("id"),
                    "index": index,
                    "is360": bool(media.get("is360")),
                    "evidence": f"listingData.commonInfo.gallery.media[{index}]",
                })
            declared_count = chips.get("imagesCount")
            if declared_count != len(photos):
                raise ValueError(f"Official image count {declared_count} differs from parsed gallery length {len(photos)}")
            if not photos:
                raise ValueError("Official listing gallery contains no photos")
            return listing_id, {
                **base,
                "resolvedSourceURL": final_url,
                "httpStatus": status,
                "sourcePostId": info["postId"],
                "title": info.get("topTitle"),
                "ownerId": owner["id"],
                "ownerName": owner.get("fullName"),
                "ownerMemberLink": owner.get("memberLink"),
                "count": len(photos),
                "declaredImagesCount": declared_count,
                "declaredVideosCount": chips.get("videosCount", 0),
                "matchesDeclaredCount": True,
                "photos": photos,
                "otherMedia": non_images,
                "evidence": "Public HTML self.__next_f.push JSON; listingData.commonInfo postId and ownerData.id verified before extracting gallery.media",
                "originalURLMethod": "Observed gallery.media.uri resolved at the image CDN origin; no preview size/suffix is added",
            }
        except (urllib.error.URLError, TimeoutError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as error:
            if attempt < 2:
                time.sleep(attempt + 1)
            else:
                return listing_id, {**base, "count": 0, "photos": [], "error": str(error)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()
    listings = json.loads(SOURCE.read_text())["listings"]
    if args.limit:
        listings = listings[:args.limit]
    audit = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(collect, listing) for listing in listings]
        for future in concurrent.futures.as_completed(futures):
            listing_id, entry = future.result()
            audit[listing_id] = entry
            print(f"{listing_id}: {entry['count']} photos" + (" ERROR " + entry["error"] if entry.get("error") else " owner verified"), flush=True)
    # Preserve the actual active catalogue order, not completion order.
    ordered = {str(listing["id"]): audit[str(listing["id"])] for listing in listings}
    DESTINATION.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n")
    errors = [key for key, value in ordered.items() if value.get("error")]
    print(json.dumps({"listings": len(ordered), "photos": sum(row["count"] for row in ordered.values()), "errors": errors, "output": str(DESTINATION)}, ensure_ascii=False), flush=True)
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
