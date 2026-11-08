"""Create the link-preview photo for each published car (WhatsApp, Facebook, X).

og/car-<id>.jpg: the listing's first photo, cropped to 1200x630 (the size link previews use).
JPEG rather than WebP, because some apps don't show WebP previews.
Existing files are kept, so the script is quick to re-run after new listings are added.
"""
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
catalog = json.loads((ROOT / "src/catalog-data.json").read_text(encoding="utf-8"))
admin = json.loads((ROOT / "src/admin-data.json").read_text(encoding="utf-8"))
edits = admin.get("edits", {})
cars = []
for vehicle in [*catalog, *admin.get("cars", [])]:
    replaced = (edits.get(vehicle["id"]) or {}).get("replace")
    cars.append((vehicle["id"], (replaced or vehicle)["image"]))

def make(job):
    car_id, photo = job
    source = ROOT / "public" / photo.lstrip("/")
    target = ROOT / "public/assets/og" / f"car-{car_id}.jpg"
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        return 0
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        # Crop to 1200x630, keeping the centre of the photo (where the car is).
        preview = ImageOps.fit(image.convert("RGB"), (1200, 630), Image.Resampling.LANCZOS, centering=(0.5, 0.52))
        preview.save(target, "JPEG", quality=82, optimize=True, progressive=True)
    return 1

with ThreadPoolExecutor() as pool:
    made = sum(pool.map(make, cars))
print(f"Link-preview photos: {made} made, {len(cars) - made} already up to date ({len(cars)} cars).")
