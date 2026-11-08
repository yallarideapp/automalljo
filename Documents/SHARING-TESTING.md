# Sharing image correction — 8 November 2026

The brand sharing image is now a new 1200 × 630 JPEG, configured in `app/src/app-meta.json`. The root, localized V2 pages, Twitter previews and dealership structured data use the same configured image. Each car retains its individual 1200 × 630 photo. The new asset URL is `assets/automall-share-v2.jpg` (194,345 bytes).

Validation before publication:

- Full TypeScript check and production build passed against main commit `84baadb6763305c91b61f99cb8633ded345ab5d6`.
- Static verification passed for 158 localized public pages plus both old homepage redirect pages. The new verifier reads the actual PNG/JPEG dimensions and requires them to match the Open Graph width/height; it also checks the Twitter image URL.
- A negative check changed the built homepage's declared width to 1199. The verifier correctly rejected it; the original output was restored.
- The complete test command reported 14 passing tests and two failures in old template tests: `security-headers.test.ts` still expects Higgsfield authentication frames, and `landing-contract.test.ts` still expects a ScrollScrub homepage. Both failures were reproduced using unchanged files from the base commit. The ten catalogue tests pass.
- Visually inspected the final JPEG: the whole car and AutoMall name remain visible, without stretching. The image-generation prompt and asset provenance are in `refs/social-share-v2.md`.

Production verified: GitHub Actions run `42488591025` passed build and deployment for commit `861cab9bbc9d19cb397894f11b0959a5f0343663`. Live HTTP checks with the `facebookexternalhit` user agent covered eight routes: both old homepage addresses, both V2 homepages, both catalogue pages and an individual car in both languages. All returned HTTP 200 with one correct `og:image`, matching Twitter image and declared 1200 × 630 dimensions. Both the new brand JPEG (194,345 bytes) and the existing Zeekr car JPEG returned HTTP 200 and measured exactly 1200 × 630. No message was sent through WhatsApp or another social account as part of these checks.
