# AutoMall Jo

A bilingual car-dealership website with AutoMall's original Instagram vehicle photos, searchable featured collection, vehicle details, trade-in enquiries, WhatsApp links, showroom directions and an interactive studio hero.

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

## Build with an existing toolchain

From `app/`, provide `VITE_SITE_URL` as the full final URL (including the repository path for a project site) and `VITE_BASE_PATH` as that deployment pathname. Then run:

```sh
node scripts/prepare-pages.mjs
bun run typecheck
bun run build
node scripts/verify-pages.mjs
```

The final static site is in `app/dist/client`. Package manifests and lockfiles are unchanged from the supplied project. Cloudflare-related scaffold modules remain inert source; GitHub Pages does not deploy a Worker, server functions or secrets. The Pages Vite configuration prerenders the active brochure routes under Node and disables the original runtime inspector.

Search indexing remains disabled through `noindex` metadata and `robots.txt` until the owner explicitly launches indexing. The sitemap lists the six real localized routes.

## Review before a commercial launch

Review the displayed phone/address, featured vehicles, privacy policy and commercial terms. Confirm the dealership's legal entity name, message retention, hosting log retention, warranty, returns and delivery terms. No commercial terms have been invented. This is not legal advice; the author is not a lawyer.

Local dependency installation and compilation were unavailable in the editing sandbox. The reviewed source checks passed; the GitHub Actions type check, build and output verification must succeed before deployment is considered verified.
