# AutoMall Jo
Design read: For Jordanian car buyers who want choice, striking vehicles and a direct conversation with a local showroom.
Concept spine: The showroom spotlight. A continuous reveal takes the visitor from silhouette to detail before opening the actual collection.
Delivery tier: cinema.
Animation mode: animated-website
Journey shape: single-shot.
Journey: Arrival (0-5s): Your next drive. At AutoMall. One centered graphite sports sedan enters the studio light.
Journey: Presence (5-10s): camera glides around its front quarter, revealing the wheel and sculpted body.
Journey: Possibility (10-15s): a closing three-quarter beauty view invites visitors into the real collection below.
World grammar: graphite studio #111315, soft silver #E7E9E9, brand orange #ED8738; soft upper-right white key, subtle orange architectural stripe; clean automotive lacquer, matte floor, locked exposure, no logos or text.
Mobile framing: keep the car inside the central 45 percent; mobile crop is centered at 60 percent; text moves below the vehicle.
Delivery budget: desktop clips <=32 MiB; mobile <=16 MiB.
Journey enactment: the visitor moves the spotlight with their scroll, slowing down to appreciate the details before choosing a vehicle.
Locked palette: #111315 background, #191C1E panel, #E7E9E9 ink, #A7ADAF muted, #ED8738 accent.
Palette defense: orange derives from the user's supplied Instagram brand badge. This is an existing-brand exception to the graphite/orange default ban.
Locked type: Outfit display and body with IBM Plex Mono small labels; Noto Sans Arabic for Arabic copy.
Theme paradigm: Deep Dark.
Background character: full-bleed cinematic imagery.
Typography character: clean grotesk.
Hero architecture: massive image-first, lower-left over-image copy, centered vehicle, restrained type.
Section system: gallery-led cadence.
Signature components: layered image crop frames; hover-accordion slices; vertical rhythm lines; off-grid editorial.
Narrative spine: stage/spotlight.
Second-read moment: a macro crop carrying the brand orange in the trade-in banner.
Corners: sharp precision edges throughout. Round controls only for utility close/phone controls.
Section plan: 1. Journey image canvas, 2. Collection asymmetric two-column gallery, 3. Trade-in panoramic banner, 4. Visit showroom address/location split, 5. Questions ruled accordion.
Hero: exactly title, short paragraph and CTA row. Navigation is separate.
Eyebrow budget: 2 across 5 sections; one collection label, one contact label.
Mobile collapse: collection becomes one column; trade-in text stacks; showroom becomes one column; nav gets an accessible menu.
Asset plan: one six-frame storyboard; four section boards; one generated 15s film with desktop/mobile encodes and exact posters; real Instagram logo and vehicle photos; one custom icon sheet; two macro background plates; one branded launch cover scene composed into cover, OG and wide OG.
Brand assets take precedence: use the original AutoMall logo and vehicle images from the supplied Instagram page.
CTA inventory: Browse cars uses an orange cut-corner plate with arrow movement; WhatsApp uses a fine border with corner focus; vehicle details use a complete editorial row with traveling arrow; directions uses a map-pin target; call uses a simple large phone link; filters use tabs with a translating underline.
Functional scope: English/Arabic toggle; searchable and filterable source-backed collection; vehicle detail dialog with original post link; WhatsApp enquiry with model prefilled; trade-in enquiry; directions and telephone; accessible mobile nav and FAQ.
Data integrity: featured cars are selected from real Instagram posts, with no invented stock status, price, financing or testimonials. Confirm availability/prices with the showroom.
Contact: AutoMall, Mecca Street 148, Amman, Jordan 11112; +962 79 905 0000; instagram.com/automalljo.
Privacy: no tracking or embedded third-party maps; no submitted personal data retained by this site; WhatsApp opens only after user action.
Legal: bilingual Privacy Policy, Terms and brand trademark notice, linked from footer. No sales contract or reservation created online.
Implementation: use the prebuilt scrub controller unchanged; no second video timeline. Native CSS and browser animation because GSAP and Lenis are not provisioned. Do not add dependencies.
Accessibility: visible focus, labeled filters, keyboard-operable dialog and menu, reduced motion static posters and no video requests.
SEO: AutoDealer schema with verified NAP, canonical and complete social metadata; robots noindex until owner explicitly launches indexing.


Media availability: both current cinematic video models rejected submission because the account has zero video credits. No video job was submitted or billed. The approved fallback is a 10-second continuous camera push-in of a generated hero still, encoded into desktop/mobile seekable film and driven by the original scroll controller. It is illustrative brand imagery, not a real stock listing.
Generation capability: GPT Image required a paid plan. Soul Cinema still images were available with one concurrent job, so references, plates, custom icons and cover used that available model serially.
Motion stack: Bun, dependencies, Lenis and GSAP were unavailable in the editing environment. No dependencies were installed. CSS and requestAnimationFrame drive surrounding motion; the shipped scrub engine owns video time.
Semantic story: the one shot reveals arrival, presence and possibility as camera moments under one permanent hero heading; collection, trade-in and showroom are the following semantic chapters.
Prior build: no previous website in this chat; identity-axis repetition does not apply.

## Hero revision, 2026-10-29
The user explicitly asked to replace the blurry animation with something better. Replace the active video journey with an interactive studio hero: native 1672×940 alpha PNG, bounded image sizing, vector-sharp CSS lighting rails, finite light reveal and gentle input-responsive depth. Keep the legacy controller untouched and unused. Mobile shows the complete car in its own stage above the text. No cover cropping, upscaled MP4 or runtime video fetch. Both language routes share the same component. Reduced motion freezes all decorative movement while preserving content and controls. The image is illustrative brand artwork, separate from real source-backed vehicle listings.
