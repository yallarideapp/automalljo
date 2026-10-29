# AutoMall V2 visual reference research

Observed 2026-10-29. This is an original design direction, not a template reproduction. Existing V1 remains at its current route; V2 is intended for `/v2/` and `/ar/v2/`.

## Access and evidence

- Supplied BBT reference: <https://www.behance.net/gallery/26871141/BBT>. Initial web-reader/HTTP access returned 403, but the public project was subsequently opened and visually inspected in the parent chat’s browser without signing in. Exact project: **BBT Website Design**, Jitendra Singh Danu, published 5 June 2015. The two visible project modules are 175456729 and 175456727.
- Motorflow's supplied root is a template preview index: <https://motorflowtemplate-showcase.webflow.io/>. Followed its actual navigation to [Home V1](https://motorflowtemplate-showcase.webflow.io/home-pages/home-v1), [Home V2](https://motorflowtemplate-showcase.webflow.io/home-pages/home-v2), [Home V3](https://motorflowtemplate-showcase.webflow.io/home-pages/home-v3), [Store](https://motorflowtemplate-showcase.webflow.io/ecommerce-pages/store), and [Product detail](https://motorflowtemplate-showcase.webflow.io/product/edge-r2).
- Visually inspected the official page-preview images linked by the root HTML. Temporary research copies: `/tmp/automall-v2-reference/home-v1.png`, `home-v2.png`, `home-v3.png`, `shop.png`, `product.png`. These are **publisher-supplied preview images, not browser screenshots**, and are outside the repository. None are product assets for AutoMall.
- Read the public [Motorflow style guide](https://motorflowtemplate-showcase.webflow.io/template-pages/styles-and-components) via its normal HTML. Reference palette: `#050607`, `#090A0C`, `#121418`, `#3B3E45`, `#7C818D`, `#B6BCC9`, `#DCE3F3`, white. Primary font: **Inter Tight**. Display steps 72/60/48/36px, largest line-height 1.115; paragraphs 18/16/14px at 1.5. These values describe the reference, not required AutoMall tokens.

## What the reference actually does

- Continuous almost-black canvas; near-silver car renders and white type carry the contrast. Color comes chiefly from headlights/material photography. Little visible ornament, shadow, or card chrome.
- Compact logo at upper left; small rounded navigation cluster at upper right and a circular menu button. Tiny dot-led eyebrow text gives hierarchy without a large label.
- Home V1 puts a large three-quarter vehicle across the top, then aligns a two-line heading on the left with price/CTA on the right. Home V2 centers headline and CTA above a frontal car. Home V3 offsets a left headline, rear three-quarter car, and right body/CTA.
- Generous voids, visually around 64–100px between major groups, make the image feel premium. Headings are tightly tracked, ordinary-weight sans rather than condensed racing type.
- Feature content groups an outline icon, short benefit title and concise description. Alternating exterior/interior/detail photography breaks up the long dark page. Three benefit themes repeat across the home variants.
- Store opens with an image-led featured model and small slider dots; popular models sit in a horizontally arranged card row. Image cards have restrained rounding and a small price pill near the image corner.
- Product detail uses roughly a 55/45 split: large photo left, three square thumbnails below; model, price, selectors and full-width action right. Large price and ample spacing make the practical information clear.
- Actual motion behavior was **not runtime-observed** during the initial reference preview inspection. Slider controls are observed; the animation recommendations below are our own implementation direction.

## Recommended AutoMall V2

1. **Art direction:** black/white editorial dealership. Use a graphite hero/footer and an ivory-white inventory section for a substantial change from V1. Keep AutoMall orange `#ED8738` for selected filters, small rules, active indicators, and primary actions. Avoid replacing the dealer identity with the reference's invented single-model EV brand.
2. **Type and grid:** use the existing local neutral sans family; keep display typography tight and clean. Desktop headline 76–104px, line-height 0.98–1.06, body 16–18px. A 12-column layout within 1280–1440px, outer gutters 48–64px, narrow supporting text columns. Use short numbered/eyebrow labels and thin dividers. Arabic keeps natural letter spacing and a roomier line-height.
3. **Hero:** original asymmetric layout: large two-line AutoMall message above/alongside one real wide vehicle image, with model/year and browse/enquire actions in a compact lower information row. Preserve photographic sharpness: max 1600px image, modest transform range, no giant zoom or blurry video. A second interior photo can appear as a small editorial inset rather than a full-screen collage.
4. **Inventory:** white background, black type, flat 3-column desktop cards with 3:2 media, fine border/divider and 12–16px image radius. Let the whole car remain visible. Model/year is primary, JOD price next, then three small sourced facts. Keep actual verified data, source links, full gallery, search/filter and WhatsApp flows. Use selected segmented filters rather than a wall of decorative pills.
5. **Feature icon presentation:** three clean outline SVGs with 24–28px consistent stroke geometry, short dealership-specific headings and 1–2 lines. Suitable truthful themes: electric/hybrid/petrol choice, complete photo galleries, direct showroom enquiries. Vehicle range/spec benefits must come from that model's catalog entry; never reuse reference figures or reviews.
6. **Editorial feature:** a wide cabin/material photo with a 40/60 copy/photo split, short heading, and a link to the actual model. Use a compact specification band with real year/powertrain/body type. Follow with a showroom visit/contact block, not fabricated testimonials or investor logos.
7. **Interactions:** finite staggered heading/image entrance; 8–16px reveal distance; 1.025 maximum fine-pointer card zoom; photo/gallery controls with keyboard focus. One modest scroll-linked image/parallax movement is enough. Let reduced motion show the settled layout, and do not pin several viewport heights ahead of the real inventory. No automatic carousel is needed.
8. **Mobile:** 20px gutters, 42–56px headline, body 16px; stack the landscape hero image and copy. Use 3:2 media instead of portrait `cover` if showing the whole vehicle matters. Inventory becomes one column on phones / two on tablets. All actions at least 44px; enquiry remains visible early. Shorten spacing to 40–56px, keep document scroll native, and mirror layout logically for RTL.

## Existing original dealer photography to use

All below are verified AutoMall gallery assets, 1600×1068 WebP. Paths are site asset paths; files live under `app/public`. None require new media or template images. Details and crop notes are already in `refs/research/scroll-photo-selection.json`.

| Role | Asset | Model | Desktop focal position |
|---|---|---|---|
| Primary hero | `/assets/catalog/gallery-287890822-1.webp` | 2024 BMW i5 eDrive35L M Sport | `50% 58%` |
| Hybrid/SUV feature | `/assets/catalog/gallery-288440948-1.webp` | 2026 Jetour G700 | `50% 74%` |
| Cabin editorial | `/assets/catalog/gallery-288630286-11.webp` | 2024 BMW i5 M60 xDrive | `50% 58%` |
| Material detail inset | `/assets/catalog/gallery-288630286-5.webp` | BMW i5 M60 crystal control/red leather | `50% 50%` |
| 4×4 feature | `/assets/catalog/gallery-287516454-1.webp` | 2025 Mercedes-Benz G580 | `50% 64%` |

The wide exterior images need landscape slots to show complete vehicles. Portrait full-bleed crops necessarily show only a front quarter; do not claim an entire-car composition in those slots. Existing AutoMall marks in source photographs can remain.

## BBT visuals observed in the public project

The exact supplied BBT project uses white and pale-grey mobile and desktop layouts, a large Mercedes side-profile hero with model/price, compact vertical specification icons, a brand selection grid and a three-column vehicle collection. Thin outlines define the cards, while model/year/fuel/engine/transmission details remain visible. Rounded outline “explore” buttons and short red accent rules contrast with the otherwise restrained monochrome design. AutoMall V2 takes the readable grid/specification structure and uses original orange branding; no BBT images, logos, celebrity promotions or template code are copied.
