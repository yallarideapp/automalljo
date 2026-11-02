"""Make the homepage banner photos for the cars chosen in the admin panel.

Dealer photos (assets/catalog/) carry an orange AutoMall logo in the bottom-right corner;
it is painted out in the banner copy. Photos uploaded in the admin panel are copied as they are.
Output: public/assets/banner/banner-<id>.webp. Existing, up-to-date files are kept.
"""
import json
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
settings = json.loads((ROOT / "src/site-settings.json").read_text(encoding="utf-8"))
catalog = json.loads((ROOT / "src/catalog-data.json").read_text(encoding="utf-8"))
admin = json.loads((ROOT / "src/admin-data.json").read_text(encoding="utf-8"))
cars = {car["id"]: car for car in [*catalog, *admin.get("cars", [])]}


def remove_logo(image):
    height, width = image.shape[:2]
    x0, y0 = int(width * 0.74), int(height * 0.82)
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    orange = cv2.inRange(hsv, (5, 90, 110), (30, 255, 255))
    mask = np.zeros((height, width), np.uint8)
    mask[y0:, x0:] = orange[y0:, x0:]
    if int((mask > 0).sum()) < 500:
        return image
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8), iterations=2)
    out = cv2.inpaint(image, mask, 6, cv2.INPAINT_TELEA)
    soft = cv2.GaussianBlur(cv2.dilate(mask, np.ones((9, 9), np.uint8)).astype(np.float32) / 255, (0, 0), 5)[..., None]
    out = out * (1 - soft * 0.7) + cv2.GaussianBlur(out, (0, 0), 4) * soft * 0.7
    rng = np.random.default_rng(7)
    return np.clip(out + rng.normal(0, 2.5, out.shape) * soft, 0, 255).astype(np.uint8)


made = 0
for car_id in settings.get("bannerCars", []):
    car = cars.get(car_id)
    if not car:
        continue
    source = ROOT / "public" / car["image"].lstrip("/")
    target = ROOT / "public/assets/banner" / f"banner-{car_id}.webp"
    if target.exists() and target.stat().st_mtime >= source.stat().st_mtime:
        continue
    target.parent.mkdir(parents=True, exist_ok=True)
    image = cv2.imread(str(source))
    if car["image"].startswith("/assets/catalog/"):
        image = remove_logo(image)
    cv2.imwrite(str(target), image, [cv2.IMWRITE_WEBP_QUALITY, 90])
    made += 1
print(f"Banner photos ready: {made} created.")
