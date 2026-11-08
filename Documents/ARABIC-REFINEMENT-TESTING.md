# Arabic catalogue and finance refinements — 8 November 2026

## Changes

- Replaced directional text glyphs with SVG arrows, mirrored once for Arabic. Gallery, banner, featured-car controls, back links and calls to action share the same direction rule. The gallery counter separates Arabic labels from Western digits.
- Reworked Arabic banner typography into two deliberate lines, removed the trailing heading full stop and contained the description in its own column. Kept the current four-car film and both colour themes.
- Replaced the hybrid category's Defender photograph with the actual 2021 Toyota Camry LE Hybrid photograph from the catalogue.
- Centralized price formatting: both languages use Western digits and comma grouping, for example `32,900 دينار`. The calculator also accepts Arabic/Persian numerals and separators, normalizing them to Western digits.
- Removed equipment chips from all car cards; full equipment stays inside each car's information panel.
- Added `/v2/finance/` and `/ar/v2/finance/`. Header, mobile navigation, menu and footer link to the calculator instead of showroom news. The old news URLs redirect to the calculator. Each individual car keeps one calculator, placed after its information, photos and related cars at the bottom of the main content.
- Replaced the transmission highlight with electric range for BEVs or fuel consumption in `L/100km` for petrol and hybrid cars. Added consumption to catalogue cards, the information panel and the comparison table. The complete specifications still include transmission.

## Fuel data

The original dealer data has 27 electric ranges but no fuel-consumption figures. Linked manufacturer/distributor references were recorded for 17 of 43 petrol/hybrid listings. The other 26 display “Not available” / “غير متوفر”; no numbers were inferred from engine size, battery capacity or driving range. The audit and all source URLs are in `refs/research/fuel-consumption-audit.json`.

Source records match the listing's brand, model, year, engine and trim before use, so an admin replacing a car does not inherit the old figure. The detail page shows the source/test cycle and relevant battery-charge condition. Toyota Camry's 52 US mpg and Land Cruiser's 10.1 km/L were converted to 4.5 and 9.9 L/100km respectively. The original Maserati 2009 manufacturer technical sheet is preserved on an archival host and identifies its original maserati.com page.

## Validation

- TypeScript and the production build passed. The focused catalogue/presentation suite has 16 passing tests and 319 assertions, including all 27 ranges in both languages, Western digit formatting, correct reference matching, depleted-battery PHEV labels and known payment calculations.
- Browser review covered 48 page/language/viewport combinations: home, catalogue, finance and electric/hybrid/petrol details in Arabic and English at 320, 390, 900 and 1280 px. No page overflow, missing primary heading, Arabic/Persian digits, card equipment chips or broken loaded images were found. Every car calculator was the last block in the main content.
- A further 12 dark-mode checks covered home, finance and Camry details in both languages at 320 and 1280 px (60 responsive cases in total), with no overflow or console warnings/errors.
- The Arabic gallery's next control advanced to photo 2 of 29; its previous control is on the right and next on the left, using one mirrored SVG each. Reviewed actual desktop and mobile banner screenshots in light and dark mode.
- The standalone Arabic calculator accepted `٢٩٬٠٠٠`, displayed `29,000` and calculated 387 JOD/month for a 20% down payment, zero rate and 5 years. Keyboard End selected 7 years and recalculated to 276 JOD/month. For 30,000 JOD, 20% down, 5% and 5 years it showed 453 JOD/month.
- Old Arabic news navigation redirected to the dedicated finance page; no browser warnings/errors were reported. No enquiry message or personal-data form was submitted during testing.
- Static guards require Western digits, no equipment rows on cards, a Camry hybrid category image, navigation to the finance page, range/consumption highlights and one calculator after the car gallery/specifications. Existing preview, source, gallery, range and indexing safeguards remain.

Production verified: GitHub Actions run `42490541423` passed the build, static checks and Pages deployment for commit `ccb1cb9e8ccb82663f32a022552a1ebb89dd7f56`. The live Arabic home shows the two-line banner, SVG arrows, Camry hybrid photograph, Western prices and no equipment chips on cards. Next/previous banner controls selected G580 and returned to Porsche. The live finance page calculated 453 JOD/month for 30,000 JOD, 20% down, 5% over 5 years. Live Zeekr, Camry and Maserati pages showed 615 km, 4.5 L/100km and 15.71 L/100km respectively; each calculator is the last block in main. The live Zeekr next-photo button advanced to 2 of 29, and the old English news link redirected to finance. A live 390 px Arabic homepage check had no overflow; no browser warnings/errors were reported. Proof screenshots: `automall-arabic-refined-live.jpg`, `automall-arabic-mobile-live.jpg` and `automall-finance-live.jpg`.
