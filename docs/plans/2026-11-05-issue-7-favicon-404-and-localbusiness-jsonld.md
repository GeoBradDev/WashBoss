# Plan: Favicon returns 404 in production and LocalBusiness structured data has invalid values (issue #7)

Risk tier: Medium. The change is static markup and image files with no runtime code, and a unit test can check the JSON-LD and that every referenced asset exists. Not forced High: no payments, auth, data, jobs, or outward messages. Starts Low, +1 because it alters existing behavior (the icon links and the published structured data change, and search engines read the result), and whether browsers actually render the icon and how Google reads the JSON-LD cannot be fully proven by a unit test.

Domain skills:
- superpowers:test-driven-development: invoke (the new test is written first and fails on the current `index.html`).
- chrome-devtools-mcp:chrome-devtools: invoke for the live drive against `vite preview` (icon URLs return 200 with the right content type, the tab icon renders, no 404 in the network log).
- vercel-react-best-practices: not applicable because no React code changes.
- frontend-design: not applicable because no UI layout or styling changes; the icons are derived from the existing logo.
- All other listed skills (Django, FastAPI, Expo, etc.): not applicable because this is a Vite React static site.

## User decisions (via the orchestrator)

- `email`: remove the key entirely. No address is published.
- `areaServed`: an array of three `AdministrativeArea` entries, "St. Louis City", "St. Louis County", "St. Charles County", each with `containedInPlace` set to `{ "@type": "State", "name": "Missouri" }`.
- No `sameAs` Google Business Profile URL and no `geo` coordinates. The existing empty `"sameAs": []` carries no data and is removed with it, so "leave it out" holds literally.
- No other business fact changes (name, description, url, telephone, image, logo, address, priceRange, opening hours, offer catalog stay byte-for-byte the same).

## Acceptance criteria

1. `public/` contains `favicon.ico` (32x32), `icon-192.png` (192x192 PNG) and `apple-touch-icon.png` (180x180 PNG), each square, generated from `public/SCSL.jpeg` by cropping to the circular emblem, with an opaque background (the logo's black), and each small (target under 10 KB for the ico, under 40 KB for each PNG; exact byte sizes reported in the PR).
2. `index.html` no longer references `/vite.svg`. It has `<link rel="icon" href="/favicon.ico" sizes="32x32">`, `<link rel="icon" type="image/png" href="/icon-192.png" sizes="192x192">` and `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` (180x180).
3. Every local asset URL in `index.html` (root-relative `href`/`src` values, and absolute `https://washbosspw.com/...` URLs in meta tags and JSON-LD) maps to a file in `public/` or a source file in the repo (`/src/main.jsx`), apart from the site root and page URLs (`https://washbosspw.com/`).
4. The JSON-LD block parses as JSON, `@type` is `LocalBusiness`, it has no `email` key, and `areaServed` is the array of three `AdministrativeArea` entries above, each contained in State Missouri. No `sameAs` and no `geo` key.
5. All other JSON-LD fields are unchanged from `origin/main`.
6. A Vitest test in `src/test/` asserts criteria 2 (no vite.svg, icon and apple-touch-icon links present), 3, and 4. It fails on the current `index.html` (vite.svg missing, email present, areaServed is a State object).
7. `public/SCSL.jpeg` is unchanged, and so is its preload tag (issue #6 owns those).
8. The full gate passes: `npm ci`, `npm run lint`, `npm test`, `npm run build`, and `dist/` contains the three icon files.
9. Live drive on `vite preview`: `/favicon.ico`, `/icon-192.png`, `/apple-touch-icon.png` return 200 with `image/x-icon` (or `image/vnd.microsoft.icon`), `image/png`, `image/png`; the page load shows no 404 in the network log; the tab icon renders the logo.
10. The JSON-LD is validated with validator.schema.org or Google's Rich Results Test (code snippet) where reachable, else by hand against the schema.org definitions of `LocalBusiness.areaServed`, `AdministrativeArea` and `Place.containedInPlace`. Results reported in the PR.

Post-deploy only (listed in the PR for the human to check after merge): production icon URLs return 200, the tab shows the logo, Rich Results Test on the live URL shows LocalBusiness with no `email`/`areaServed` issues, iOS "Add to Home Screen" uses the logo.

## Files that change

- `public/favicon.ico` (new, binary)
- `public/icon-192.png` (new, binary)
- `public/apple-touch-icon.png` (new, binary)
- `index.html` (icon links, JSON-LD `email`, `areaServed`, `sameAs`)
- `src/test/indexHtml.test.js` (new)
- this plan

Not committed: the one-off generator script, kept in the run's scratch directory. Generation uses Python Pillow, already installed on the machine; no npm dependency is added.

## Order of work

1. Red test: write `src/test/indexHtml.test.js`. It reads `index.html` and `public/` with `node:fs` (same pattern as `cname.test.js`), parses the HTML with jsdom's `DOMParser` (the test environment is jsdom) or regex, and asserts criteria 2, 3 and 4. Run it, record the failing output, commit it alone (`test: ...`).
2. Generate the icons with a scratch Python Pillow script: find the bounding box of non-black pixels in `SCSL.jpeg` (the emblem), ignoring a 20px border band because the JPEG has a faint light frame at its edges that otherwise makes the box the whole image, take a square crop centered on it with a small margin, flatten onto black, resize with LANCZOS to 180 and 192 (PNG, optimized, quantized to a 256-colour palette because the RGB 192px PNG came out at 40.9 KB, over the 40 KB target, and the palette version is visually identical side by side at about 16 KB) and to 32 (ICO with a single 32x32 image). Inspect each output visually at 1x and enlarged. Report byte sizes.
3. Edit `index.html`: replace the vite.svg link with the three icon links; in the JSON-LD remove `email` and `sameAs`, replace `areaServed`. Touch nothing else.
4. Run the test green, then the full gate, then the live drive. Commit (`fix: ...`).

## Risks

- The 32px icon of a detailed logo is a small blob. Mitigation: crop tight to the emblem so the orange ring and blue splash dominate; check by eye at 32px. Text will not be readable at 32px, which is expected for a favicon.
- Browsers request `/favicon.ico` by default even without a link; providing it at the root also covers that.
- `vite preview` falls back to `index.html` for missing files, so a 200 there does not prove a file exists. The live drive checks content type, and the unit test checks the file on disk.
- The asset-existence test could miss URL forms. It covers `href`/`src`/`content` attributes and every string value in the JSON-LD that starts with `https://washbosspw.com/`.
- Chose not to: add `site.webmanifest` (not asked), add `geo` or `sameAs` (user decision), touch `SCSL.jpeg` or the preload (issue #6), fix the em dash in the meta description (outside scope, reported).

## Proof

- Criteria 2, 3, 4, 6: `src/test/indexHtml.test.js`, red before the fix, green after.
- Criterion 5: `git diff origin/main -- index.html` shows only the icon links, `email`, `areaServed`, `sameAs` lines.
- Criteria 1, 7: `file`/Pillow dimensions and `ls -l` byte sizes; `git diff --stat origin/main -- public/SCSL.jpeg` empty.
- Criterion 8: gate output.
- Criterion 9: live drive on `vite preview` with Chrome DevTools: network log statuses and content types, screenshot of the tab icon.
- Criterion 10: validator output.
