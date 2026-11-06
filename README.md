# AutoMall Jo

A bilingual car-dealership website with 70 live public dealer listings, original vehicle photos, searchable catalogue, vehicle details, trade-in enquiries, WhatsApp links, showroom directions and a scroll-controlled photo journey.

## Project

- `app/`: React 19 and TanStack Start source, existing locked dependencies and self-hosted media.
- `refs/`: design reference boards.
- `.github/workflows/pages.yml`: candidate GitHub Pages workflow.

The repository includes no customer database, account system, online payment or submitted personal-data forms. Prices and availability are confirmed directly with the dealership. Manufacturer names identify featured vehicles. The hero uses real photos from featured dealer listings.

## GitHub Pages

Choose **GitHub Actions** under the repository's **Settings > Pages**. The workflow derives the full public URL and project subpath from `actions/configure-pages`; it does not hardcode an account or repository owner. It uses Bun's frozen lockfile installation, runs type checks, builds and verifies the static output, then uploads only `app/dist/client`.

The deployment creates 156 static HTML pages for English and Arabic, including both design versions:

- `/` and `/ar/`
- `/v2/` and `/ar/v2/`
- `/v2/cars/` and `/ar/v2/cars/`
- `/v2/features/` and `/ar/v2/features/`
- `/v2/updates/` and `/ar/v2/updates/`
- `/v2/contact/` and `/ar/v2/contact/`
- `/v2/car/<listing-id>/` and `/ar/v2/car/<listing-id>/` for each of the 70 captured listings
- `/privacy/` and `/ar/privacy/`
- `/terms/` and `/ar/terms/`

These paths are relative to the configured Pages project subpath. Arabic content is prerendered in RTL, so direct visits work without language hydration mismatches. The static 404 recovery page deliberately does not hydrate and remains usable at arbitrary missing URLs.

Generated category illustrations, original vehicle photos, fonts and social previews are served from this site. Version 1's hero is a four-chapter scroll journey through actual BMW i5, Jetour G700, BMW cabin and Mercedes G580 photographs. Scrolling drives crossfades, image depth, text movement and a progress line; chapter buttons also jump to each view. Native CSS view timelines animate compositor properties when supported, with a measured requestAnimationFrame fallback. React updates only when the active chapter changes. Mobile uses contained landscape images so the complete car stays visible. Reduced-motion visitors get all four photos and text in normal document flow. Only four hero photos are mounted. The original video engine remains inert source and no hero video is downloaded.

Hero photo selection and source listing IDs are documented in `refs/research/scroll-photo-selection.json`; the previous generated artwork remains archived in `refs/hero-v2-notes.md`.

## Catalogue snapshot

The catalogue covers all 70 live ads on AutoMall’s public OpenSooq dealer page across three pages, checked 29 October 2026. It excludes 225 sold ads. Separate active listing IDs are preserved even when the same model appears in multiple colours. This is a dated public-listing snapshot, not a guarantee of all physical showroom stock or an automatic feed.

`app/src/catalog-data.json` contains audited bilingual specifications and source links. `refs/research/` preserves the source snapshot and caption audits. Every listing carries horsepower and torque; `refs/research/power-torque.json` records the source of each figure (the dealer caption, or the manufacturer specification where the caption is silent or conflicts). The Farizon H8E truck has no published torque figure, so only its power is shown. EV range is explicitly seller advertised and does not promise a real-world result. All 27 pure-electric listings include the advertised range from their own seller captions, with stated test cycles and qualifiers preserved. Only 19 explicit current full-vehicle prices are displayed in JOD; the Yangwang U8 down payment is not presented as a purchase price.

All 1,537 original dealer photographs across the 70 listings are self-hosted as optimized WebP files, verified against `app/catalog-images.json`. The CI sync script downloads only missing photos from the source CDN, verifies their source bytes, creates the pinned 1600-pixel WebP derivatives and commits the verified gallery assets before building. Original source files have no added marketplace overlay; generated category artwork does not replace any listing photograph. The image conversion changes only resolution/encoding for website delivery. Version 1 opens with 12 listings. Version 2 opens with nine, followed by load-more in groups of nine.

## Build with an existing toolchain

From `app/`, provide `VITE_SITE_URL` as the full final URL (including the repository path for a project site) and `VITE_BASE_PATH` as that deployment pathname. Then run:

```sh
python3 -m pip install Pillow==12.3.0
python3 scripts/sync-catalog-images.py
node scripts/verify-catalog.mjs
node scripts/prepare-pages.mjs
bun test tests/v2-catalog.test.ts
bun run typecheck
bun run build
node scripts/verify-pages.mjs
```

The final static site is in `app/dist/client`. Package manifests and lockfiles are unchanged from the supplied project. Cloudflare-related scaffold modules remain inert source; GitHub Pages does not deploy a Worker, server functions or secrets. The Pages Vite configuration prerenders the active brochure routes under Node and disables the original runtime inspector.

Search indexing remains disabled through `noindex` metadata and `robots.txt` until the owner explicitly launches indexing. The sitemap lists all 156 localized routes from the same manifest used by prerendering and static verification.

## Review before a commercial launch

Review the displayed phone/address, featured vehicles, privacy policy and commercial terms. Confirm the dealership's legal entity name, message retention, hosting log retention, warranty, returns and delivery terms. No commercial terms have been invented. This is not legal advice; the author is not a lawyer.

The GitHub Actions workflow performs the required type check, production build and static output verification before deploying. Local catalogue and UI checks use the bundled Node runtime.


## Version 02

The original site remains at `/` and `/ar/`. Version 2 is served separately at `/v2/` and `/ar/v2/`, with one charcoal theme and AutoMall's orange accent throughout. Home, cars, equipment, showroom updates and contact are separate pages. Every advertised car opens its own bilingual detail page with its complete original gallery, specifications, equipment icons, advertised electric range when supplied and direct WhatsApp enquiry.

The homepage starts with a four-car photograph banner and car-search form, while retaining the current pill navigation, illustrated electric/hybrid/petrol category links, six selected listings and short showroom-contact strip. The banner includes BMW i5, Mercedes-Benz G580, Jetour G700 and Porsche 911, with sideways swiping, cycling arrows, four selection dots and a matching vehicle-detail link. The search submits powertrain, brand and body style to the catalogue through ordinary GET navigation; brand logos and body icons remain inside its selectors. Responsive sizing keeps the banner and search readable on phones. News cards include photos from the related dealer listings, with the original Facebook links and paraphrased summaries retained.

On phones, the banner photograph sits behind the introduction with a dark gradient for readability. The six featured cars form a horizontal swipe row with a visible next-card edge, scroll snapping, previous/next buttons and keyboard navigation. Desktop keeps its existing three-column grid. Scrolling honors reduced-motion preferences and never advances automatically.

The catalogue has compact powertrain tabs and directly visible search, brand, body-style and sort controls. The More filters accordion and its equipment control have been removed. Body styles retain their original side-profile icons; brands retain genuine self-hosted logos for all 26 catalogue brands. Icons and logos remain visible in selected values and removable filter chips, and brand marks also appear on vehicle cards and detail pages. Source attribution is in `refs/brand-logo-sources.md`. The selectors use the existing Base UI dependency for keyboard navigation, typeahead, Escape and outside dismissal.

Powertrain, body, brand, search and sort still refine the same collection. URL parameters (`powertrain`, `body`, `brand`, `equipment`, `q`, `sort`) remain shareable across reload, language switching, opening a car and returning to the catalogue. Equipment links from the separate features page remain compatible and can be cleared through their active chip; equipment is no longer an extra catalogue input. Unsupported parameters fall back to valid defaults. Price sorting places unpriced listings last in either direction, and only source-backed full prices are displayed.

Three powertrain illustrations appear in the homepage category links. The eight body-style illustrations remain archived in `app/public/assets/categories/`, with prompts in `refs/category-art-prompts.md`. Category artwork never replaces actual vehicle photographs.

The powertrain section is titled “Shop by category”. Directly below it, “Shop by brand” follows the logo-grid layout in the supplied AutoMall Aevum reference: twelve brands initially, an expand control for all 26, actual listing counts and direct links into the filtered catalogue. Existing genuine brand-logo assets are reused.

Vehicle pages use the supplied reference’s title/statistics header, large photo stage, circular thumbnail rail, four highlights, Information/Gallery tabs and two-column specification list, adapted to the charcoal/orange theme. Every original photo remains available in the thumbnails and Gallery tab; “Open full photo” displays the uncropped original. Exact advertised ranges, battery details, prices, equipment icons, source links, language switching and filter-preserving return links remain. The reference archive supplies the layout only; its Version 1 source files are not deployed by this update.

Twenty-one original SVG automotive icons describe the source-linked equipment. Eight public AutoMall Facebook posts supply showroom updates; 25 equipment claims are corroborated by those captions and the remaining 474 come from the exact linked dealer listings. All 499 claims map to the 70 captured listing IDs; no equipment is assumed across different trims.

Design observations are in `refs/research/v2-design-reference.md`, and feature provenance is in `refs/research/facebook-feature-audit.json`. Runtime content uses `app/src/v2-feature-data.json`; category and filter rules live in `app/src/v2-catalog.ts`. Prices and technical figures retain the existing catalogue sources where Facebook values are ambiguous. No customer forms, persistent customer storage, accounts, checkout or tracking were added. The shared legal pages include Facebook among external services and remain linked from both versions. Check `Documents/TESTING.md` for validation results.

## Banner videos

The homepage banner plays one continuous film (`app/public/assets/banner/video/banner-film.mp4`, a 640 px `-phone` version and a `-poster` still): the two Google Flow videos joined so the camera moves Porsche 911 → Mercedes G580 → BMW i5 M60 → Jetour G700 and back to the Porsche without a cut. The two joins (G580 → BMW and Jetour → Porsche) are soft 1.8-second dissolves; they can be swapped for Flow-generated transitions (Frames to Video, first frame = end of one video, last frame = start of the next). The film is slowed in the file itself (each Flow video is slowed in one pass with a varying speed, 0.4–0.85×, using motion-interpolated in-between frames; the BMW holds longest), runs about 25 seconds and plays in the same box as the banner photo, so the layout is unchanged. The car name, link, counter and dots follow the car on screen (time marks in `bannerFilm` in `app/src/components/automall-v2-page.tsx`); dots and arrows jump to a car, and a pause button sits beside the counter. It waits while off screen or in a hidden tab, and stays on the poster for reduced motion or data saver.

If the banner cars are changed in the admin panel, the banner falls back to one slide per car; those four cars also have their own short loops (`banner-<id>.mp4`), listed in `bannerVideoIds`.

## Admin panel

The admin panel opens from the gear button in the bottom corner of every `/v2/` page (also `/v2/#admin` and `/admin/`). There is no login and no server: **everything it saves stays in the browser where it was made** (localStorage for edits and orders, IndexedDB for added photos). Visitors on other devices keep seeing the published site built from the repository.

- **Cars**: add cars with photos (resized to 1600 px in the browser), edit them, mark cars available, reserved or sold, hide dealer listings. Dealer listings keep their audited photos and specifications; staff can change price, status, condition, mileage, power, torque, exterior colour and description.
- **Homepage**: choose the banner cars (1–6) and featured cars (up to 12).
- **Showroom info**: phone, WhatsApp, address, map search text, social links and opening hours.
- **Orders**: customers press “Order this car” on a car page (reserve, test drive or buy). The order is stored in that browser and listed here with status, staff note, call/WhatsApp buttons and CSV download. The customer's confirmation also offers to send the order to the showroom on WhatsApp, since an order saved in a customer's own browser never reaches staff.
- **Save**: applies the changes to the site in this browser. **Reset to the published website** removes them (orders are kept).

How it works: `app/src/local-store.ts` stores the data; `app/src/local-site.ts` applies it after the page loads through `applySiteData` in `app/src/site-data.ts`, which swaps the car list and settings in place. Cars added in the panel have no prerendered page, so they open `/v2/car/local/?id=…`. The published data still comes from `app/src/catalog-data.json`, `app/src/admin-data.json` and `app/src/site-settings.json`, merged at build time (`app/src/inventory.ts`, mirrored in `app/scripts/inventory.mjs`).
