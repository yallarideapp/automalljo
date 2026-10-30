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


## 29 October 2026 — Simpler homepage and catalogue filters

- Homepage now has one three-card powertrain section. The second body-style section and repeated hero category buttons were removed; neutral previous/next arrows remain for the featured cars.
- Body style is a labelled catalogue dropdown. Search and sort stay visible, with brand and equipment under an expandable More filters panel. Active filters can be removed individually or cleared together.
- Advanced filters restored from a URL open their panel; clearing them does not collapse the focused control. Existing independent combinations, URL serialization and catalogue data remain unchanged.
- Local typecheck, production build, nine existing catalogue tests (192 assertions) and static verification of all 156 pages passed.
- Browser review covered home and catalogue in both languages at 320, 390, 900 and 1280 px: 16 cases, no horizontal overflow. Every homepage had exactly one category group, no body tiles and no repeated hero category tabs.
- Electric + sedan returned five cars; adding BMW returned two. Clearing the last advanced value kept the panel open. Removing a hidden advanced filter returned focus to its summary. Removing the body filter retained the electric selection (27 cars). Hybrid + pickup correctly remained empty; clear-all restored the catalogue and ascending price placed MG MG5 first.
- Production smoke checks are performed after the Pages deployment.

## 29 October 2026 — Body icons and vehicle-brand logos

- Added eight original side-profile body icons plus a generic all-types icon to the body-style selector and its selected value/chip.
- Added genuine, self-hosted logos for all 26 catalogue brands to the brand selector, selected value, filter chip, vehicle cards and detail pages. Preserved source colors with light/dark contrast badges. Sources and file hashes are recorded in `refs/brand-logo-sources.md`. Total optimized logo assets: 295,781 bytes.
- Used the existing Base UI Select primitives for ARIA listbox/combobox behavior, keyboard arrows/Home/End, text typeahead, Enter, Escape/focus restoration and outside dismissal. No dependencies changed.
- Typecheck, production build, nine catalogue tests (192 assertions) and static verification of all 156 pages passed.
- Browser review: home, catalogue and car detail in both languages at 320, 390, 900 and 1280 px (24 layouts), plus both selector popups at each size/language (16 menus). No horizontal overflow, popup outside the viewport, broken logo image or console warning/error was found.
- Body menu contains nine options with recognizable icons; brand menu contains 27 options with all 26 brand logos. Electric + sedan returned five cars and BMW narrowed to two; selected values showed the sedan icon/BMW logo. End reached refrigerated truck, Escape returned focus to the body trigger, Z typeahead found Zeekr, Enter selected it, and clicking outside dismissed the menu.
- All logo SVGs parsed successfully and were checked for scripts, event handlers and external references. GitHub blob hashes matched the selected local assets.
- Production verified on 30 October 2026. GitHub Actions run `40947203857` passed all checks and deployed website commit `874508179f75d642ad47c7d3a5521038b7af05b9`.
- Live body menu showed nine illustrated options; live brand menu showed all 26 logos plus the all-brands option, with no broken images. Electric + sedan + BMW returned two cars; the sedan icon and BMW badge remained after refresh and switching to English. BMW M60 detail showed its brand logo and retained its advertised 516 km WLTP range. No console errors or warnings occurred.

## 30 October 2026 — Conventional dealership homepage and direct filters

- Replaced the oversized editorial homepage with a contained real-photo hero, one car finder, six selected vehicle cards, concise information blocks and showroom/contact details. No repeated category galleries or featured-car carousel remain on the homepage.
- Removed the More filters accordion and equipment selector. Brand and body selectors remain directly visible, with their genuine logos and body icons. Fuel uses compact tabs; search, sort, per-filter chips and reset remain available.
- Simplified shared header navigation, typography, card facts and footer; aligned sections to 1200 px. News cards now show the matching dealer vehicle photograph, model/year heading and existing Facebook summary/link. All 70 listings, 1,537 gallery photographs and 27 advertised EV ranges remain in the catalogue.
- Home finder uses ordinary GET navigation. Electric + BMW + sedan produced two results. Hybrid + Toyota + sedan survived an English-to-Arabic switch and produced the single Toyota Camry listing.
- Existing nine catalogue tests (192 assertions), full typecheck, production build and static verification of all 156 localized pages passed.
- Browser review covered all six page types in both languages at 320, 390, 900 and 1280 px: 48 cases, no horizontal overflow, missing heading, additional-filter control or console warning/error. Each homepage had exactly one finder and six selected vehicles. A 1440 px desktop check confirmed shared 1200 px alignment.
- Reviewed actual screenshots of Arabic/English home, catalogue, news and contact layouts, including mobile. Home brand popup remained inside the phone viewport. Production was subsequently verified on 30 October 2026: GitHub Actions run `40975866685` deployed commit `e4c08727db3b9645c1e2c0995eb084b411f6b450`. All twelve published page/language combinations loaded without horizontal overflow, additional-filter controls or console warnings/errors. The live homepage finder returned two electric BMW sedans, and native screenshots confirmed the new homepage and single finder.

## 30 October 2026 — Refined previous split homepage

- Restored the earlier split hero with its G580, Jetour G700 and Porsche 911 dealer photos, manual carousel arrows and live vehicle facts. Restored the pill navigation and one illustrated powertrain category row. Removed the rejected full-width banner/finder homepage.
- Reduced heading sizes and spacing, contained the hero photos, kept six compact selected listings and added a short contact strip. The three category cards remain together on phones. No second category grid or additional-filter accordion was restored; genuine brand logos, body-style icons and separate pages remain.
- Full typecheck, production build, all nine existing catalogue tests (192 assertions), UI/content checks and verification of all 156 localized static pages passed.
- Browser review covered home/catalogue in Arabic and English at 320, 390, 900 and 1280 px (16 layouts): no horizontal overflow, missing primary heading or broken loaded image. Each homepage had one category group, six vehicle cards, no finder and no additional-filter control. Actual desktop, phone and tablet screenshots were reviewed.
- Hero next/previous controls advanced to Jetour G700 and returned to Mercedes-Benz G580. Electric category navigation returned 27 cars; sedan narrowed to five and BMW to two, retaining the body icon, brand logo and URL parameters.
- Production verified: GitHub Actions run `40983220266` passed build and Pages deployment for commit `9c3c2aabf2a2b70cd028500d48520eff2663b7d1`. Arabic and English homepages show the restored split design; live hero navigation advances to Jetour G700 and the electric category returns 27 cars. Desktop and 390 px phone layouts have no horizontal overflow or additional-filter controls; no browser warnings/errors were reported. Proof screenshot: `automall-refined-home-live.jpg`.

## 30 October 2026 — Restore banner and homepage search

- Restored the earlier BMW i5 photograph banner and homepage GET search. Kept the current illustrated category row, six compact featured vehicles, contact strip, pill navigation, genuine brand logos, body-style icons and all catalogue/detail features.
- Typecheck, production build and static verification passed for all 156 localized pages, including complete vehicle galleries and advertised EV ranges. The verifier now requires the photo banner and search alongside the existing categories and featured cars.
- Browser review covered both homepage languages at 320, 390, 900 and 1280 px (eight layouts): one banner, one search, one category group, six featured cars and no horizontal overflow. Brand and body menus remained inside the phone viewport; no browser warnings/errors were reported.
- Native homepage form submission for electric + BMW + sedan opened the catalogue with all three URL parameters and returned two listings.
- Production verified: GitHub Actions run `40999975787` passed the build and Pages deployment for commit `afefc7d3e58d01d11af0e6316be293076ca8e85c`. The live homepage displays the BMW banner, search, category row and six featured cars. Submitting electric + BMW + sedan returned two listings with all three URL parameters; no browser warnings/errors occurred. Proof screenshot: `automall-banner-search-live.jpg`.

## 30 October 2026 — Phone photo banner and sideways featured cars

- Phone banner now keeps the BMW photograph behind its copy, with a dark gradient, readable calls to action and a top vehicle badge. The crop shows the vehicle clearly at 320–430 px.
- The six homepage featured cars use native horizontal scrolling and snap alignment on phones, with a next-card peek, a visible scrollbar, 44 px previous/next controls and Arrow/Home/End keyboard support. Buttons disable at the edges; scrolling respects reduced motion. Desktop retains the three-column grid. Search, categories, logos, body icons, galleries and EV ranges remain.
- Full typecheck, production build and static verification of all 156 localized pages passed. Browser checks covered Arabic and English at 320, 390, 430 and 1280 px: no document overflow, six cards in every layout, scrollable phone rows and the unchanged desktop grid.
- Native horizontal scrolling advanced the Arabic row; arrows and Home/End reached both ends in both languages, with correct disabled buttons. No browser warnings/errors were reported.
- Production verified: GitHub Actions run `41001255895` passed build and Pages deployment for commit `89a23d9cf6c8a49d25c2bfa54704847cff904c0e`. At 390 px, the live banner uses the photograph behind the copy and the six featured cars scroll sideways. Native horizontal scrolling and the next button advanced through the row; End reached the final car and disabled next. No page overflow or browser warnings/errors were reported. Proof screenshots: `automall-phone-banner-live.jpg` and `automall-phone-cars-live.jpg`.

## 30 October 2026 — Four cars inside the banner

- Replaced the single BMW banner image with four distinct dealer vehicles inside the banner itself: BMW i5, Mercedes-Benz G580, Jetour G700 and Porsche 911. Native sideways swiping, cycling arrows, four direct-selection dots and a 1–4 counter work on desktop and phones. The active vehicle badge and detail link follow the visible car.
- Added a static-output regression check requiring banner photographs from four distinct vehicle listings. Search, illustrated categories, the separate featured-car row, all vehicle galleries and EV ranges remain intact.
- Browser checks covered Arabic and English at 320, 390, 900 and 1280 px. All four banner photographs appeared with matching detail URLs, no broken loaded image and no document overflow. Native horizontal scrolling over the banner copy advanced from BMW to G580. Next wrapped from Porsche to BMW; previous wrapped back, and resizing kept the selected car.
- The carousel uses native scroll snapping, keyboard navigation and reduced-motion handling; no automatic advancing or new dependency was added.
- Production verified: GitHub Actions run `41002555424` passed build and Pages deployment for commit `e0b71af6aa0b07d5fb2df76703ae565315d61760`. Live swiping selected G580 (2/4), next selected Jetour (3/4) and the Porsche dot selected Porsche (4/4), with matching detail links. All four photos loaded; no document overflow or browser warnings/errors occurred. Proof screenshot: `automall-four-car-banner-live.jpg`.
- A follow-up width guard preserves the selected vehicle during phone rotation/resizing. G580 remained selected through 390 → 1280 → 320 → 900 → 390 → 1280 → 390 px. The final production build and verification of all 156 localized pages passed after this adjustment.
