# AutoMall Jo testing

## 29 October 2026 — Version 2: dark theme and separate pages

### Scope

- Version 2 uses one charcoal theme with the AutoMall orange accent.
- Home, cars, equipment, showroom updates and contact have separate English and Arabic routes.
- Every one of the 70 advertised cars has its own static detail page in both languages, with its existing photographs, dealer specifications and advertised electric range where supplied.
- The catalogue has independent powertrain (electric, hybrid, petrol) and body-style filters. Brand, equipment, search and sorting can be combined and shared through URL parameters.
- New category illustrations are separate from original dealer listing photographs.
- Version 1 and the existing legal pages remain available. Search-engine indexing remains blocked.
- Real contact links, source-linked listings and Facebook posts remain in use. No checkout, account system or demo orders were introduced by this revision.

### Completed checks

- `bun test tests/v2-catalog.test.ts`: **9 tests passed, 192 assertions**, using Bun 1.4.4 from the temporary build tools directory.
- Category coverage: **70** cars; electric **27**, hybrid **34**, petrol **9**. Each car belongs to exactly one primary powertrain.
- Body coverage: SUV **49**, sedan **11**, pickup **3**, van **3**, coupé **1**, shooting brake **1**, targa **1**, refrigerated truck **1**.
- Independent combinations checked, including electric SUV **15**, electric sedan **5**, hybrid SUV **29**, hybrid sedan **4**, petrol SUV **5**, petrol sedan **2**, and empty hybrid/pickup.
- URL round trip, invalid parameter fallback, bounded search, combined brand/model/equipment filters, and price sorting with unpriced cars last passed.
- Static manifest: **156 unique localized paths**, including **70 car pages per language**, ten Version 2 overview pages and six existing pages.
- JavaScript syntax checks passed for `scripts/page-manifest.mjs` and `scripts/verify-pages.mjs`.
- `git diff --check` passed at the route/test handoff.
- Full local typecheck and production build passed after the UI and all eleven category illustrations were ready.
- `scripts/verify-pages.mjs` passed against the production build: all 156 localized pages, canonical URLs, indexing rules, complete galleries and advertised electric ranges were verified.

### Browser verification

- Local browser checks completed for all six page types in English and Arabic at 320, 390, 900 and 1280 px: **48 cases**, no horizontal overflow, every page has its primary heading, and every V2 page uses `rgb(11, 13, 15)` as its background.
- Screenshots reviewed for every page type in both languages, including small-phone layouts. No browser errors or warnings were reported during the final sweep.
- Electric sedan returned five cars; hybrid sedan returned four. The four-car selection survived refresh and switching to Arabic. Detail links and the catalogue breadcrumb preserved the powertrain/body filters.
- Zeekr 7X standalone gallery showed all 29 photographs; next-photo navigation worked and its advertised 615 km range appeared in both languages. Mobile navigation opened and closed with five independent page links.

### Live delivery verification

- GitHub Actions run `40931611346` completed successfully: category tests, typecheck, production build, all 156 static-output checks, artifact upload and Pages deployment. Deployed website commit: `f9d258bbac22bbe0d860563a44160f005a516a95`.
- All 12 published page-type/language combinations loaded successfully, hydrated without console warnings/errors, retained the charcoal background and showed no horizontal overflow.
- On production, electric + sedan returned five listings after refresh and language switching. Opening Zeekr 7X showed all 29 photographs and its 615 km advertised range; next photo advanced to 2/29. Returning to the electric + SUV catalogue retained both filters and returned 15 listings.
- Eleven generated category WebPs are deployed; original dealer galleries and Version 1 remain available.

The production output verifier now checks all 156 localized HTML documents, canonical URLs and indexing rules, complete car galleries and electric ranges, category image assets, independent catalogue filter groups, and Version 1's four-photo hero.

### Content to confirm with the showroom

The catalogue remains the public-listing snapshot checked on 29 October 2026. Current availability, unadvertised prices, exact trim details, warranty terms and opening hours require showroom confirmation. Category artwork is illustrative; individual listing galleries use the original dealer photographs.

