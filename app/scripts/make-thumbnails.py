"""Create small copies of the dealer photos used on car pages and cards.

thumbs/: every gallery photo, at most 450x300, for thumbnail strips and gallery grids.
cards/:  each listing's first photo, at most 800x800, for car cards.
Existing files are kept, so the script is quick to re-run after new listings are added.
"""
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
catalog = json.loads((ROOT / "src/catalog-data.json").read_text(encoding="utf-8"))
jobs = []
for vehicle in catalog:
    photos = dict.fromkeys([vehicle["image"], *vehicle.get("gallery", [])])
    for photo in photos:
        jobs.append((photo, "thumbs", (450, 300), 68))
    jobs.append((vehicle["image"], "cards", (800, 800), 76))

def make(job):
    photo, folder, size, quality = job
    source = ROOT / "public" / photo.lstrip("/")
    target = ROOT / "public/assets" / folder / (Path(photo).stem + ".webp")
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return 0
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGB")
        image.thumbnail(size, Image.LANCZOS)
        image.save(target, "WEBP", quality=quality, method=5)
    return 1

with ThreadPoolExecutor(8) as pool:
    made = sum(pool.map(make, jobs))
print(f"Thumbnails ready: {made} created, {len(jobs) - made} already up to date.")
