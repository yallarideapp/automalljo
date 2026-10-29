# AutoMall Jo

A bilingual car-dealership website with 70 live public dealer listings, original vehicle photos, searchable catalogue, vehicle details, trade-in enquiries, WhatsApp links, showroom directions and an interactive studio hero.

## Project

- `app/`: React 19 and TanStack Start source, existing locked dependencies and self-hosted media.
- `refs/`: design reference boards.
- `.github/workflows/pages.yml`: candidate GitHub Pages workflow.

The repository includes no customer database, account system, online payment or submitted personal-data forms. Prices and availability are confirmed directly with the dealership. Manufacturer names identify featured vehicles. The hero is an illustrative brand visual.

## GitHub Pages

Choose **GitHub Actions** under the repository's **Settings > Pages**. The workflow derives the full public URL and project subpath from `actions/configure-pages`; it does not hardcode an account or repository owner. It uses Bun's frozen lockfile installation, runs type checks, builds and verifies the static output, then uploads only `app/dist/client`.

The deployment creates separate HTML pages for English and Arabic:

- `/` and `/ar/`
- `/privacy/` and `/ar/privacy/`
- `/terms/` and `/ar/terms/`

These paths are relative to the configured Pages project subpath. Arabic content is prerendered in RTL, so direct visits work without language hydration mismatches. The static 404 recovery page deliberately does not hydrate and remains usable at arbitrary missing URLs.

Generated images, original vehicle photos, fonts and social previews are served from this site. The current hero uses a native-resolution transparent car cutout with CSS lighting, bounded pointer depth and scroll movement. The image stays fully visible on mobile. Reduced-motion visitors receive the same complete composition without movement. The original video engine remains inert source and no hero video is downloaded.

Hero artwork and the built-in generation prompt are documented in `refs/hero-v2-notes.md`.

## Catalogue snapshot

The catalogue covers all 70 live ads on AutoMall’s public OpenSooq dealer page across three pages, checked 29 October 2026. It excludes 225 sold ads. Separate active listing IDs are preserved even when the same model appears in multiple colours. This is a dated public-listing snapshot, not a guarantee of all physical showroom stock or an automatic feed.

`app/src/catalog-data.json` contains audited bilingual specifications and source links. `refs/research/` preserves the source snapshot and caption audits. Performance figures with conflicting trims or test cycles are omitted. Only 19 explicit current full-vehicle prices are displayed in JOD; the Yangwang U8 down payment is not presented as a purchase price.

All 70 source photographs are self-hosted WebP files, verified against `app/catalog-images.json`. The CI sync script downloads only missing photos from the source CDN, verifies their exact bytes and commits the originals before building. No generated substitute vehicle photos are used. The catalogue opens with 12 listings, with brand/fuel filters, bilingual search and load-more.

## Build with an existing toolchain

From `app/`, provide `VITE_SITE_URL` as the full final URL (including the repository path for a project site) and `VITE_BASE_PATH` as that deployment pathname. Then run:

```sh
python3 scripts/sync-catalog-images.py
node scripts/verify-catalog.mjs
node scripts/prepare-pages.mjs
bun run typecheck
bun run build
node scripts/verify-pages.mjs
```

The final static site is in `app/dist/client`. Package manifests and lockfiles are unchanged from the supplied project. Cloudflare-related scaffold modules remain inert source; GitHub Pages does not deploy a Worker, server functions or secrets. The Pages Vite configuration prerenders the active brochure routes under Node and disables the original runtime inspector.

Search indexing remains disabled through `noindex` metadata and `robots.txt` until the owner explicitly launches indexing. The sitemap lists the six real localized routes.

## Review before a commercial launch

Review the displayed phone/address, featured vehicles, privacy policy and commercial terms. Confirm the dealership's legal entity name, message retention, hosting log retention, warranty, returns and delivery terms. No commercial terms have been invented. This is not legal advice; the author is not a lawyer.

The GitHub Actions workflow performs the required type check, production build and static output verification before deploying. Local catalogue and UI checks use the bundled Node runtime.
