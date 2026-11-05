# Plan: 1.8 MB logo is preloaded at high priority but displayed at 220px or smaller (issue #6)

Risk tier: Medium (user override from High). The rule count gives High: starts Low, +1 because a unit test cannot prove what matters here (which `srcset` candidate a real browser fetches, sharpness at 1x and 2x, Lighthouse audits, load timing on Slow 4G, how social crawlers read the card), +1 because it alters existing behavior (every logo request, the preload, the `og:image`/`twitter:image` and the JSON-LD `logo`/`image` change), +1 for more than a few files. Not forced High: no payments, auth, data, jobs, or outward messages. The user lowered it to Medium, matching the precedent of the similar static-asset change in #7: the change is images and markup with no new runtime logic, and what a unit test cannot cover is covered by the live drive. The user asked to keep the full Medium-plus live drive anyway: Lighthouse before and after, the Slow 4G / 4x CPU trace, and the screenshot comparison.

Domain skills:
- superpowers:test-driven-development: invoke (the new test file is written first and fails on `origin/main`).
- chrome-devtools-mcp:chrome-devtools and chrome-devtools-mcp:debug-optimize-lcp: invoke for the live drive (Lighthouse mobile before and after, the Slow 4G / 4x CPU trace, the network log of which logo files load, screenshots).
- vercel-react-best-practices: invoke while editing the three components (image attributes only; no rendering or state changes).
- frontend-design: not applicable because the look must stay identical; no design change.
- All other listed skills (Django, FastAPI, Expo, Notion, etc.): not applicable because this is a Vite React static site.

## Scope decisions (from the orchestrator)

- JSON-LD `logo` and `image` both use the square `logo-512.jpg` (user decision).
- In scope: right-sized WebP logo variants with `srcSet`/`sizes`, a preload that matches the hero exactly, a 1200x630 JPEG social image with `og:image`/`twitter:image` (plus width, height, type, alt), and a square JSON-LD `logo`/`image`.
- `public/SCSL.jpeg` stays in the repo, byte-for-byte unchanged, so old shared links still resolve. Nothing on first load requests it.
- Out of scope: prerendering, `React.lazy` for the Lightbox, the JS chunk size. Favicons from #7 are untouched.
- `src/test/indexHtml.test.js` (from #7) is frozen and is not edited. It must keep passing.
- No npm dependencies. Images are made with Python Pillow (installed), from a one-off script in the run's scratch directory, not committed (same approach as #7). The recipe is recorded below so it can be repeated.

## Acceptance criteria

1. `public/` contains square WebP logo variants `logo-112.webp`, `logo-168.webp`, `logo-280.webp`, `logo-320.webp`, `logo-440.webp`, `logo-660.webp`, each exactly N x N pixels where N is the number in its name, made from `SCSL.jpeg` with the same center-square crop that `object-fit: cover` shows today, so the visible logo is unchanged.
2. A shared module `src/logo.js` builds the logo `srcSet` (every variant with a `w` descriptor, under `import.meta.env.BASE_URL`) and the fallback `src`. Navbar, Hero and Footer each render the logo `img` with that `srcSet`, a `sizes` matching their display size (Navbar `56px`, Footer `80px`, Hero `(min-width: 900px) 220px, 160px`, MUI's `md` breakpoint is 900px), and a `src` fallback of a WebP variant. No component references `SCSL.jpeg`. All other img attributes (alt, `fetchPriority`, `loading`, `decoding`, sx sizes, border radius, object fit) are unchanged.
3. For each logo slot (navbar 56, footer 80, hero 160 below 900px and 220 at 900px and up) and each device pixel ratio 1, 1.75, 2, 3, the `srcSet` holds a candidate at least as wide as display size x DPR, so the browser never upscales.
4. Total bytes of the logo files a browser picks on first load (navbar plus hero; the footer is `loading="lazy"` and below the fold) are under 100 KB for a 375px viewport at DPR 1.75 and 3 and a 1440px viewport at DPR 1 and 2. (Computed by the test with the standard selection rule: the smallest candidate whose width is at least slot width x DPR.)
5. `index.html` no longer references `SCSL.jpeg` anywhere. Its image preload is `<link rel="preload" as="image" type="image/webp" fetchpriority="high">` whose `href`, `imagesrcset` and `imagesizes` equal the Hero img's `src`, `srcset` and `sizes` exactly, so the preloaded file is the one the hero uses.
6. `public/og-image.jpg` is a baseline JPEG, 1200x630, the logo emblem centered on the site background `#0a0a0a`, under 150 KB. `og:image` and `twitter:image` are `https://washbosspw.com/og-image.jpg`, with `og:image:width` 1200, `og:image:height` 630, `og:image:type` `image/jpeg`, and `og:image:alt` / `twitter:image:alt` describing the logo. `twitter:card` stays `summary_large_image`.
7. `public/logo-512.jpg` is a 512x512 JPEG of the same square crop. JSON-LD `logo` and `image` both point at `https://washbosspw.com/logo-512.jpg`. No other JSON-LD field changes.
8. `public/SCSL.jpeg` is byte-for-byte unchanged, the favicon files are unchanged, and `src/test/indexHtml.test.js` is unchanged and passes.
9. A new Vitest file `src/test/logo.test.jsx` asserts criteria 1 to 7 (dimensions read from the file headers, byte budget from file sizes, selection computed from the rendered `srcset`). It fails on `origin/main`.
10. The full gate passes: `npm ci`, `npm run lint`, `npm test`, `npm run build`, and `dist/` contains every new image file.
11. Live drive on the production preview (`npm run build && npm run preview`), before (origin/main build) and after:
    - Lighthouse mobile: "Properly size images" and "Efficiently encode images" list no logo file after the change. Before and after scores and the two audits reported.
    - Network log on first load at 375px (DPR 1.75 mobile emulation) and 1440px: no request for `SCSL.jpeg`; logo bytes reported, under 100 KB; the preloaded file is the same one the hero uses (one request, no duplicate).
    - Performance trace with Slow 4G and 4x CPU at 375px: the hero logo is fully rendered (image request finished and painted) within 3 s of navigation start. Before and after times reported.
    - `/og-image.jpg` and `/logo-512.jpg` return 200 with `image/jpeg` on the preview, and the tags point at them. An online card validator is tried; its result, or the fact that none was reachable, is reported. (The preview is localhost, so a validator cannot fetch it; the check against production is a post-merge item.)
    - Screenshots of navbar, hero and footer at 375px and 1440px, before and after, at DPR 1 and 2: the logo looks the same and is sharp.

Post-merge (for the orchestrator): production `/og-image.jpg` and `/logo-512.jpg` return 200; a card validator (for example opengraph.xyz or LinkedIn Post Inspector) on `https://washbosspw.com/` shows the 1200x630 card; Lighthouse mobile on production shows no logo entry in the two image audits; Rich Results Test still reads the LocalBusiness with the new `logo`.

## Files that change

- `public/logo-112.webp`, `public/logo-168.webp`, `public/logo-280.webp`, `public/logo-320.webp`, `public/logo-440.webp`, `public/logo-660.webp` (new)
- `public/logo-512.jpg`, `public/og-image.jpg` (new)
- `src/logo.js` (new): `LOGO_WIDTHS`, `logoSrc(width)`, `logoSrcSet`, and the three `sizes` strings (`NAVBAR_LOGO_SIZES`, `FOOTER_LOGO_SIZES`, `HERO_LOGO_SIZES`).
- `src/components/Navbar.jsx`, `src/components/Hero.jsx`, `src/components/Footer.jsx`: the logo img `src`, plus `srcSet` and `sizes`.
- `index.html`: preload, `og:image`, `twitter:image`, new `og:image:*` and `twitter:image:alt` tags, JSON-LD `logo` and `image`.
- `src/test/logo.test.jsx` (new)
- this plan

Not changed: `public/SCSL.jpeg`, favicons, `src/test/indexHtml.test.js`, README (it does not name the logo file; Phase 8 confirms).

## Order of work

1. Red test. Write `src/test/logo.test.jsx` (jsdom env, `renderWithTheme` from `src/test/renderWithTheme.jsx`, `node:fs` like `indexHtml.test.js`). Helpers: `webpSize(buf)` that reads VP8 (bytes 26-29, 14-bit), VP8L (bytes 21-24) and VP8X (bytes 24-29, 24-bit minus 1) headers; `jpegSize(buf)` that walks markers to the SOF0/SOF2 frame; `parseSrcset(str)` into `{ url, w }`; `pick(candidates, needed)` = smallest `w >= needed`. Tests:
   - each `logo-N.webp` exists, is WebP, is N x N (criterion 1);
   - render Navbar, Hero, Footer; the logo img in each has the expected `sizes`, a `srcset` whose URLs are exactly the six variants with matching `w`, a `src` that is one of them, and no `SCSL.jpeg` (criterion 2);
   - for each slot and DPR, `pick` returns a candidate (criterion 3);
   - for each viewport/DPR combo in criterion 4, the sum of the picked navbar and hero files' byte sizes is under 100 * 1024 (criterion 4);
   - `index.html` has no `SCSL.jpeg`; exactly one `link[rel=preload][as=image]`, and its `href`/`imagesrcset`/`imagesizes`/`type`/`fetchpriority` match the rendered Hero img (criterion 5);
   - `og:image` and `twitter:image` URLs, `og:image:width/height/type`, the alt tags, and `og-image.jpg` is a 1200x630 JPEG under 150 KB (criterion 6);
   - JSON-LD `logo` and `image` equal the `logo-512.jpg` URL and that file is a 512x512 JPEG (criterion 7).
   Run it, record the failing output under `## Proof`, commit it alone (`test: ...`).
2. Generate the images with a scratch Pillow script (recipe):
   - Open `SCSL.jpeg` (3553x3761, RGB). Paint a 20 px border band black: the JPEG has a faint grey frame at its edges (pixel (0,0) is (156,156,156)) that would bleed into the outer pixel when downscaled. The band is 0.6% of the width and lies outside the circle the site clips to, so nothing visible changes.
   - Center-square crop: `(0, 104, 3553, 3657)`, which is exactly what `object-fit: cover` shows in a square box.
   - WebP: resize with LANCZOS to 112, 168, 280, 320, 440, 660; save `quality=85, method=6`. Prototype sizes: about 4, 7, 15, 18, 27, 46 KB.
   - `logo-512.jpg`: same crop at 512, `quality=85, optimize=True, progressive=False`.
   - `og-image.jpg`: crop to the emblem bounding box (non-black pixels inside the 20 px band, as #7 did), scale to fit about 560 px tall, and composite onto a 1200x630 `#0a0a0a` canvas with `ImageChops.lighter` (per-channel max) so the logo's pure black background becomes exactly `#0a0a0a` with no visible square seam, while the colored artwork (all channels well above 10) is unchanged. Save `quality=85, optimize=True, progressive=False`.
   - Inspect every output by eye at 1x and enlarged. Report byte sizes.
   Widths are chosen so every slot has an exact or near fit: 112 = navbar 56 x2 (and 1.75x), 168 = navbar x3, 280 = hero 160 x1.75 (Lighthouse's mobile DPR, so the audit sees an exact fit), 320 = hero 160 x2, 440 = hero 220 x2, 660 = hero 220 x3; footer 80 picks 112/168/280.
3. Add `src/logo.js` and edit the three components. Hero: `src={logoSrc(440)}`, `srcSet={logoSrcSet}`, `sizes={HERO_LOGO_SIZES}`. Navbar: `src={logoSrc(112)}`, `sizes="56px"`. Footer: `src={logoSrc(168)}`, `sizes="80px"`. No other attribute changes.
4. Edit `index.html`: replace the preload with `<link rel="preload" as="image" type="image/webp" href="/logo-440.webp" imagesrcset="<same srcset>" imagesizes="(min-width: 900px) 220px, 160px" fetchpriority="high" />`; point `og:image`/`twitter:image` at `/og-image.jpg`, add `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt`, `twitter:image:alt`; point JSON-LD `logo`/`image` at `/logo-512.jpg`.
5. Run the new test green, run `src/test/indexHtml.test.js` (unchanged) green, then the full gate. Commit (`perf: ...`).
6. Live drive (criterion 11). Before figures come from a build of `origin/main` served with `npm run preview` on another port; after from this branch.

## Risks

- Preload and hero mismatch: if `imagesrcset`/`imagesizes` differ from the img by even a space, Chrome fetches twice. Mitigation: the test compares them string-for-string, and the live drive checks the network log for a single hero logo request.
- `sizes` versus real layout: the hero is 160 px below 900 px and 220 px at 900 px and up (MUI `md`). If the theme's breakpoints changed, `sizes` would be wrong. The theme uses default breakpoints (checked: `src/theme.js` sets none).
- A blurrier logo: the variants are downscaled with LANCZOS from the 3553 px source and the selection never upscales (criterion 3). Screenshots at DPR 1 and 2 confirm.
- The grey frame removal changes pixels that were outside the visible circle; the comparison screenshots confirm no visible change.
- WebP with no fallback: every browser the site's React 19 and MUI 9 bundle supports (Safari 14+, Chrome, Firefox, Edge) decodes WebP, and the gallery already ships WebP only.
- Social crawlers cache `og:image` by URL. A new URL (`og-image.jpg`) avoids stale caches; old shares of `SCSL.jpeg` still resolve because the file stays.
- The frozen `indexHtml.test.js` checks that every root-relative `href`/`src`/`content` and every absolute site URL exists in `public/`; the new preload `href`, `og:image`, `twitter:image` and JSON-LD URLs are all real files, so it keeps passing. `imagesrcset` is not one of its checked attributes; the new test covers those URLs.
- Lighthouse thresholds: "Properly size images" ignores savings under 4 KiB. The 280 px variant gives an exact fit at DPR 1.75, so the hero shows no waste in the mobile audit.
- Chose not to: AVIF (Pillow AVIF support is not guaranteed here and WebP already meets the budget), a `<picture>` element (not needed without a fallback format), committing the generator script (Python in a JavaScript-only repo; the recipe above is the record), prerendering and `React.lazy` (out of scope), removing `SCSL.jpeg` (kept for old links).

## Proof

- Criteria 1 to 7, 9: `src/test/logo.test.jsx`, red on `origin/main`, green after.
- Criterion 8: `git diff --stat origin/main -- public/SCSL.jpeg public/favicon.ico public/icon-192.png public/apple-touch-icon.png src/test/indexHtml.test.js` is empty, and the frozen test passes in the gate.
- Criterion 10: gate output and `ls dist/` for the new files.
- Criterion 11: Lighthouse reports, network log, trace figures, and screenshots from the live drive, before and after.
