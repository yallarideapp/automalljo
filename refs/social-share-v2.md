# AutoMall sharing image — 8 November 2026

- Asset: `app/public/assets/automall-share-v2.jpg`, exactly 1200 × 630 pixels.
- Source reference: the existing `app/public/assets/automall-og.png` brand graphic.
- Created with the built-in `image_gen` image editing tool, then exported to an optimized JPEG at the exact sharing dimensions with macOS `sips`.
- The new filename gives crawlers a new image URL. `app/src/app-meta.json` holds its URL, actual dimensions, format and alt text; the root page, V2 pages and dealership schema use that configuration. Individual car pages keep their own car photographs.
- `verify-pages.mjs` reads PNG/JPEG headers and compares actual image dimensions with the Open Graph metadata on every static public page and both old homepage redirect pages. It also checks that Twitter uses the same image.

## Image generation prompt

Edit target: the attached existing AutoMall social sharing graphic. Reformat into a polished wide landscape Open Graph card, aspect ratio exactly 1200:630 (40:21), ideally output exactly 1200 by 630 pixels. Maintain the original dark charcoal and vivid orange AutoMall brand, the dark metallic SUV photographed in the orange sculptural arch showroom. Preserve recognizable appearance of SUV and architecture. Recompose rather than stretch or crop important content. Place the entire vehicle on the right, three-quarter front view, fully inside the frame. On the left use only the exact large crisp white text 'AUTOMALL' and underneath 'JO', smaller. Top left may show the existing small original AutoMall orange logo. Remove the original 'Explore the collection' button, corner dots, unnecessary circular outer frame, and all other text. Background fills all edges with dark charcoal and orange architectural curves. Keep 70 pixels safe margin around important text and car, clear at small social previews. Premium clean automotive dealer graphic. No new brand logos, no added slogans, no watermarks.
