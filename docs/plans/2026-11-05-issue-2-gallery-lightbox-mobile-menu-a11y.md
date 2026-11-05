# Plan: Gallery, lightbox, and mobile menu are not keyboard or screen-reader accessible (issue #2)

Risk tier: High. Starts Low, +1 stateful interactive UI that unit tests cannot fully exercise (focus trap, focus restore, the drawer's aria-hidden focus warning only shows in a real browser), +1 alters existing behavior (thumbnails become buttons, the lightbox's key handling changes, the logo becomes a link), +1 more than a few files (three components, four test files, a new test helper, `package.json`, `package-lock.json`). Not forced High by any listed category: no email, payments, auth, or data. The orchestrator may lower it to Medium; the three bumps are the reason it is High.

Domain skills:
- superpowers:test-driven-development: invoke (red test first for every defect).
- vercel-react-best-practices: invoke while editing the three components (keep `PHOTOS` a module constant, no new effects or re-render churn).
- chrome-devtools-mcp:a11y-debugging: invoke for the live drive (tab order, accessible names, focus, console warnings).
- chrome-devtools-mcp:chrome-devtools: invoke for the live drive and the Lighthouse audits.
- context7-plugin:docs: invoke if MUI v9 `Modal`, `Drawer`, or `ButtonBase` behavior needs confirming.
- frontend-design: not applicable because nothing is redesigned; the thumbnails, lightbox, and navbar keep their current look.
- All other listed skills (Django, FastAPI, Expo, Claude API, etc.): not applicable because this is a Vite React static site.

## Scope boundaries

- Out of scope, owned by issue #5: `main` and `nav` landmarks, heading order, and moving focus to a section after an in-page nav link scrolls. Do not add `component="nav"`, `<main>`, or headings. If a change here cannot avoid touching them, stop and return `BLOCKED`.
- Out of scope, owned by issue #4: color contrast. Do not change colors. The axe tests disable `color-contrast` (jsdom cannot compute it anyway).
- The contact form (`Contact.jsx`) is not touched, and the live drive never submits it.

## Acceptance criteria

1. Every gallery photo is reachable with Tab and opens the lightbox with Enter and with Space.
2. Inside the lightbox, Tab and Shift+Tab cycle only among Previous, Next, and Close. ArrowLeft and ArrowRight change the photo. Escape closes it, calling `onClose` exactly once. On close, focus returns to the thumbnail that opened it.
3. The lightbox is exposed as a dialog (`role="dialog"`, `aria-modal="true"`) with an accessible name. On open, focus moves to the Close button.
4. The hamburger has the accessible name "Open navigation menu", `aria-expanded` that is `false` when closed and `true` while open, and `aria-controls` pointing at the drawer paper's id.
5. Opening the mobile drawer moves focus into it, closing it (Escape, backdrop, or a nav item) returns focus to the menu button, and Chrome's console shows no aria-hidden focus warning ("Blocked aria-hidden on an element because its descendant retained focus").
6. The navbar logo is a focusable link with an accessible name that scrolls to the top when activated by click or Enter.
7. Each of the 22 photos has its own short, specific, truthful alt text, kept in one data array in `Gallery.jsx` (table below). Each thumbnail button is named `Open photo N of 22: <alt>`; the full-size lightbox image uses the same alt.
8. `src/components/Navbar.test.jsx` finds the hamburger with `getByRole('button', { name: 'Open navigation menu' })`, not the `MenuIcon` test id.
9. axe-core run in Vitest on the Gallery (closed), the open Lightbox, and the Navbar (closed and with the drawer open) reports no violations, with only `color-contrast` disabled (and `region` if it fires on an isolated component render, with a comment saying landmarks are issue #5).
10. Lighthouse (mobile, production preview) `button-name` passes after the change; the accessibility score is recorded before and after.
11. Gate passes: `npm ci`, `npm run lint`, `npm test`, `npm run build`.

## Alt text (from looking at each full-size image in `public/`)

Several photos are side-by-side before and after pairs; where the left half is clearly the dirty one, the alt says "before and after". Where the order is reversed or unclear, the alt says which half is which or does not claim a before/after.

| # | alt |
| --- | --- |
| 01 | Two-story white house with a dark two-level deck and staircase |
| 02 | Collage of five homes with clean siding, decks, and a brick chimney |
| 03 | Stone retaining wall and patio beside wooden stairs, before and after cleaning |
| 04 | Cream siding with dark mildew streaks above a patio, before and after washing |
| 05 | Front concrete walkway beside a rock bed, before and after cleaning |
| 06 | Brick home with a composite deck, stairs, and chimney |
| 07 | Stained concrete driveway, before and after cleaning |
| 08 | Yellow siding gable with mildew under string lights, before and after washing |
| 09 | Wash Boss pickup truck and branded trailer parked on a residential street |
| 10 | Pool diving board and deck, before and after cleaning |
| 11 | Two-story gray home with a stone lower level and patio |
| 12 | Yellow siding with green algae around a window, before and after washing |
| 13 | Restaurant drive-through lane, wet after a night wash |
| 14 | Sidewalk being cleaned with a surface cleaner, and the finished result |
| 15 | Concrete walkway along a brick wall, before and after cleaning |
| 16 | Back of a white-sided townhouse with string lights and steps, two views |
| 17 | Concrete patio below a deck, before and after cleaning |
| 18 | Front walkway with a landscape light, before and after cleaning |
| 19 | Cream gable siding, clean on top and stained on the bottom |
| 20 | White soffit, clean on top and covered in black mildew on the bottom |
| 21 | Tan gable siding, clean on the left and streaked on the right |
| 22 | Wet drive-through pavement with yellow striping outside a restaurant |

Use these strings verbatim (no em dashes, no emojis).

## Files that change

- `package.json`, `package-lock.json`: add `axe-core` `^4.14.0` (published 2026-10-05) as a devDependency with `npm install -D axe-core@4.14.0` (caret range in `package.json`, matching the repo's style). No jest-axe: it pulls in Jest packages; call axe-core directly.
- `src/test/axe.js` (new): `export async function axeViolations(node, extraRules = {})` that runs `axe.run(node, { rules: { 'color-contrast': { enabled: false }, ...extraRules } })` and returns `results.violations` mapped to `{ id, nodes: targets }` so a failing assertion prints readable output. Tests assert `expect(await axeViolations(...)).toEqual([])`.
- `src/components/Gallery.jsx`:
  - Replace the generated `PHOTOS` with an explicit `ALTS` array (the table above) mapped to `{ src, thumb, alt }`, so there is one data array of descriptions. Photo count comes from the array length.
  - Render each thumbnail as MUI `ButtonBase` (`focusRipple`, `aria-label={`Open photo ${i + 1} of ${PHOTOS.length}: ${photo.alt}`}`, `onClick` that records the clicked button and sets the open index, `display: 'block'`, `width: '100%'`, `borderRadius: 2`, `overflow: 'hidden'`), wrapping the existing `img` with `alt=""` (the button carries the name, so the image is decorative inside it and is not read twice). Keep the hover transform and shadow on the button, and add a visible `&.Mui-focusVisible` outline (for example `outline: '3px solid'` with `outlineColor: 'primary.main'`, `outlineOffset: 2`) using an existing theme color, not a new one.
  - Return focus explicitly: the thumbnail's `onClick` stores `e.currentTarget` in a ref, and the lightbox's `onClose` commits the close with `flushSync` (so the `Modal` has unmounted and removed `aria-hidden`) and then focuses that button. This covers Escape, the Close button, and the backdrop, and works when the opening click did not focus the button (Safari), which `FocusTrap`'s own restore cannot handle because it only remembers an element that had focus.
- `src/components/Lightbox.jsx`:
  - Delete the `useEffect` window `keydown` listener and the `useEffect` import. `Modal`'s own `onClose` handles Escape (and backdrop click).
  - On the content `Box` (the `Modal` child): `role="dialog"`, `aria-modal="true"`, `aria-label="Photo viewer"`, and `onKeyDown` handling `ArrowLeft` -> `onPrev()` and `ArrowRight` -> `onNext()` (call `preventDefault` for those two keys only). The handler returns early, without `preventDefault`, when Alt, Control, or Meta is held, so Alt+Left (browser Back) still works; Shift is treated as a plain arrow. It also calls `preventDefault` on an auto-repeated Enter (`e.repeat`), so holding Enter on a thumbnail does not click the focused Close button and flicker the lightbox closed and open. Focus is always inside this box while open because `Modal`'s focus trap enforces it, so the handler sees every arrow press.
  - Close `IconButton`: `autoFocus` so focus lands on it on open. Verify `Modal`'s FocusTrap does not then move focus to the container (it only focuses the root when focus is outside it). Order the three buttons in the DOM so Tab goes Previous, Next, Close (already the case).
  - Set `disableRestoreFocus` on the `Modal`, since `Gallery.jsx` returns focus itself; only one place moves focus.
  - Keep the full-size `img` alt as `photo.alt`.
- `src/components/Navbar.jsx`:
  - Hamburger `IconButton`: `aria-label="Open navigation menu"`, `aria-expanded={drawerOpen}`, `aria-controls="mobile-nav-drawer"`.
  - Drawer: `slotProps.paper` gains `id: 'mobile-nav-drawer'` and `'aria-label': 'Navigation menu'` (MUI gives the paper `role="dialog"`, which axe's `aria-dialog-name` requires to be named). Keep the existing `sx`, since a test asserts it.
  - Focus return and the aria-hidden warning: MUI 9.1.2's `Drawer` passes `closeAfterTransition: true` to `Modal`, so the page keeps `aria-hidden` until the slide-out exits, while `FocusTrap`'s default restore focuses the menu button as soon as closing starts. With Chrome's accessibility tree active, that logs "Blocked aria-hidden on an element because its descendant retained focus" on every close. Fix: `ModalProps={{ disableRestoreFocus: true }}` and `slotProps.transition.onExited` focusing the hamburger through a ref. `useModal` chains `onExited` after its own `handleExited`, which removes `aria-hidden`, so focus returns only once the page is exposed again. The focus trap and `aria-hidden` stay as they are. Opening needs no change: MUI already moves focus into the drawer paper without a warning.
  - Logo: wrap the `img` in `Box component="a" href="#hero"` with `aria-label="Wash Boss Pressure Washing, back to top"`, the img `alt=""`, and `onClick` that calls `preventDefault()` then `window.scrollTo({ top: 0, behavior: 'smooth' })` (the current behavior, so no URL hash is added). A native link activates on Enter, so no key handler is needed. Add a visible focus outline the same way as the thumbnails. Do not move focus after the scroll (issue #5).
- `src/components/Gallery.test.jsx`: update the existing tests to query thumbnails by role `button` and name, and add the new tests listed under Proof, plus held Enter and focus return after a click that did not focus the thumbnail (Escape, Close button, backdrop, with no aria-hidden ancestor at the moment of focus).
- `src/components/Lightbox.test.jsx` (new): the Escape-once test, the dialog role test, and the modified-arrow test live here, rendering `Lightbox` directly with `vi.fn()` handlers.
- `src/components/Navbar.test.jsx`: replace `screen.getByTestId('MenuIcon').closest('button')` in `openDrawer` with `screen.getByRole('button', { name: 'Open navigation menu' })`, and add the new tests listed under Proof, including a logo click test. All tests render through a phone-layout theme: the real theme with only the breakpoint values raised (`md: 1200`), because jsdom evaluates media queries at a fixed 1024px width where the hamburger is `display: none`. The three existing tests keep their assertions; only how they render and find the hamburger changes.
- `src/components/NavbarDrawerFocus.test.jsx` (new): closing the drawer by Escape, a nav item, or the backdrop returns focus to the menu button, and no ancestor of the button is `aria-hidden` at the moment it receives focus.
- `README.md`: only if a statement in it becomes false (it mentions `src/test/` and the test runner; add nothing unless needed).

## Order of work

0. Before any code change, build and serve the unchanged branch (`npm run build`, then `npm run preview -- --port 4173 --strictPort`), run Lighthouse accessibility at mobile width on `http://localhost:4173/`, and record the score and the `button-name` result. Also open the drawer at 375px and capture the console output (the aria-hidden warning, or its absence). Stop the preview server.
1. Add axe-core and `src/test/axe.js`. Commit.
2. Lightbox: red tests (Escape calls `onClose` once; dialog role and name; Close focused on open; arrow keys call `onPrev` and `onNext`; axe clean), commit them red, fix, green, commit.
3. Gallery: red tests (22 buttons with the expected names; Enter and Space open the lightbox on the right photo; focus returns to the thumbnail on close; Tab cycles inside; axe clean), commit red, implement the alt array and buttons, green, commit.
4. Navbar: switch the query first (this fails red until the label exists, which is the proof), plus red tests for `aria-expanded`, `aria-controls`, focus moving into the drawer, focus returning to the hamburger on Escape, the logo link, and axe clean (closed and open). Commit red, implement, green, commit.
5. Full gate. Then the live drive and the after Lighthouse run.

Each red test commit contains only tests and is listed in `.claude/fix-lock` until it passes; the implementation commit changes only production code.

## Risks

- Focus behavior differs between jsdom and Chrome. jsdom tests prove the wiring; the live drive in Chrome is the proof for criteria 2, 3, and 5, especially the aria-hidden warning, which jsdom never emits.
- `autoFocus` on the Close button vs `Modal`'s FocusTrap: if the trap focuses the container after the button, focus lands on the dialog box instead. A test asserts `document.activeElement` is the Close button, and the live drive checks it.
- Removing the window keydown listener: arrow keys only work while focus is inside the dialog. The focus trap keeps it there; if a user clicks the backdrop the dialog closes anyway.
- `ButtonBase` around the thumbnail changes layout slightly (inline-flex). Set `display: 'block'` and `width: '100%'` so the grid looks the same; the live drive screenshot at 375px and at desktop width confirms.
- The logo `href="#hero"` with `preventDefault` keeps today's no-hash behavior; without JS the link still works.
- axe in jsdom can raise page-level rules (`region`, `landmark-*`) on an isolated render. Disabling `region` is acceptable only with a comment pointing at issue #5; disabling anything else needs a reason in this plan.
- The aria-hidden warning may come from MUI internals that `Navbar.jsx` cannot fix cleanly. If no fix within `Navbar.jsx` removes it, stop and return `BLOCKED` with the evidence rather than patching MUI or disabling `aria-hidden`.

Chose not to: switch the lightbox to MUI `Dialog` (its Paper would need restyling to keep the current look; `Modal` plus the role attributes gives the same semantics), add an `aria-live` counter, or change any colors.

## Proof

| Criterion | Test or evidence |
| --- | --- |
| 1 | `Gallery.test.jsx`: 22 buttons named `Open photo N of 22: <alt>`; `user.tab()` reaches a thumbnail; `{Enter}` and, in a separate test, ` ` (Space) open the lightbox showing the matching counter and full-size image. Live drive: Tab from the top at 375px reaches every thumbnail. |
| 2 | `Lightbox.test.jsx`: Escape calls `onClose` once; ArrowLeft and ArrowRight call `onPrev` and `onNext`. `Gallery.test.jsx`: after opening, `user.tab()` three times visits Previous, Next, Close and wraps; Escape closes and `document.activeElement` is the originating thumbnail. Live drive: same in Chrome. |
| 3 | `Lightbox.test.jsx`: `getByRole('dialog', { name: 'Photo viewer' })` has `aria-modal="true"`; Close is `document.activeElement` after open. |
| 4 | `Navbar.test.jsx`: hamburger by role and name; `aria-expanded` `false` then `true`; `aria-controls` equals the paper's `id`. Live drive: accessibility tree shows the name and state. |
| 5 | `Navbar.test.jsx`: after opening, `document.activeElement` is inside the drawer paper; after Escape, it is the hamburger. Live drive: Chrome console shows no aria-hidden warning after opening and closing the drawer, compared against the step 0 capture. |
| 6 | `Navbar.test.jsx`: `getByRole('link', { name: 'Wash Boss Pressure Washing, back to top' })`; Enter on it calls `window.scrollTo` with `{ top: 0, behavior: 'smooth' }`. |
| 7 | `Gallery.test.jsx`: the 22 names are all distinct and each contains the alt from the table; the lightbox image `alt` equals the photo's alt. |
| 8 | The diff of `Navbar.test.jsx`. |
| 9 | axe tests in `Gallery.test.jsx`, `Lightbox.test.jsx`, `Navbar.test.jsx`. |
| 10 | Lighthouse before (step 0) and after: scores and `button-name` status. |
| 11 | Gate output. |

Live drive (High): `npm run build`, `npm run preview -- --port 4173 --strictPort`, Chrome at 375x812 and at 1280x800. Drive keyboard-only through the logo, hamburger and drawer (open, Tab inside, Escape, reopen, choose a nav item), the gallery (Tab to several thumbnails, Enter, Space, arrows, Tab cycling, Escape, backdrop click, focus return), and edge paths (Previous on photo 1 wraps to 22, Next on 22 wraps to 1, opening the drawer twice in a row, resizing from mobile to desktop while the drawer is open). Never submit the contact form.

## Implementation notes

- Step 0 baseline (unchanged branch, production preview, Lighthouse mobile on `http://localhost:4173/`): accessibility 88; `button-name` failed on the hamburger (`header > div.MuiToolbar-root > button.MuiButtonBase-root`). Other failing accessibility audits: `color-contrast` (issue #4), `heading-order` and `landmark-one-main` (issue #5).
- Step 0 drawer at 375x812: opening the drawer with Enter on the hamburger, and again with a pointer click, moved focus to the drawer paper (`div.MuiDrawer-paper[role="dialog"][tabindex="-1"]`), and Escape returned focus to the hamburger. That first capture showed no aria-hidden warning (only Chrome issues "An element doesn't have an autocomplete attribute" (count 3) and "A form field element should have an id or name attribute" (count 1), both from the contact form), but only because Chrome's accessibility tree was not yet active when Escape was pressed. During the live drive, with the tree active (after an a11y snapshot, as with a running screen reader), closing the drawer logged, on this branch and on the unchanged code at 148eb69 alike:
  `[warn] Blocked aria-hidden on an element because its descendant retained focus. ... Element with focus: <button.MuiButtonBase-root Mui-focusVisible MuiIconButton-root MuiIconButton-sizeMedium css-1k2ovcf> Ancestor with aria-hidden: <div#root>`
  Opening never logged it. Cause, in MUI 9.1.2: `Drawer` passes `closeAfterTransition: true` to `Modal`, so `useModal` keeps `aria-hidden` on `#root` until the slide transition exits (`Modal/useModal.js`, the `[open]` effect and `handleExited`), while `FocusTrap` restores focus in its `[open]` effect cleanup as soon as `open` turns false (`Unstable_TrapFocus/FocusTrap.js`). Neither planned candidate (`autoFocus` on the first `ListItemButton`, or `onEntering`) addresses this, since both act on opening. The fix used, in `Navbar.jsx` only: `ModalProps={{ disableRestoreFocus: true }}` and `slotProps.transition.onExited` focusing the hamburger through a ref. `useModal` chains `onExited` after its own `handleExited`, which removes `aria-hidden`, so focus returns only once the page is exposed again. The focus trap and `aria-hidden` are unchanged. This replaces "Focus return on close uses `Modal`'s default restore". Red test: `src/components/NavbarDrawerFocus.test.jsx`.
- Correction to criterion 2: its original premise, that Escape fired `onClose` twice, did not reproduce: `Lightbox.test.jsx` "calls onClose exactly once when Escape is pressed" passes on the unchanged code, because MUI `Modal`'s Escape handler calls `stopPropagation`, so the window listener never saw Escape while focus was inside the modal. The window listener is still removed as planned (it handled arrows globally); that test and the arrow-key test guard the change.
- Criterion 8 needed a test-only phone layout: jsdom evaluates CSS media queries at a fixed 1024px width (`jsdom/lib/jsdom/living/window/environment.js`), where the hamburger's `md: 'none'` rule hides it, so `getByRole` cannot find it even with a label, and `hidden: true` does not help because the accessible name of a `display: none` element computes as empty. `Navbar.test.jsx` therefore renders under the real theme with only the breakpoint values raised (`md: 1200`), which also lets axe check the hamburger (the closed-drawer axe test failed with `button-name` before the fix, matching Lighthouse).
- Added `'aria-label': 'Navigation menu'` to the drawer paper (`slotProps.paper`): MUI 9 gives the paper `role="dialog"`, and the open-drawer axe test failed with `aria-dialog-name`. Lighthouse did not see it because the drawer is closed during its audit. The role and landmarks are unchanged (issue #5).
- After evidence, Lighthouse (mobile, production preview, `http://localhost:4173/`, at commit 628f7d4): accessibility 93 (88 before); `button-name` passes. Remaining failing accessibility audits: `color-contrast` (issue #4), `heading-order` and `landmark-one-main` (issue #5).
- After evidence, Chrome console with the accessibility tree active (a11y snapshot taken first) at 375x812: closing the drawer by Escape, by a nav item (About), and by the backdrop, and opening it twice in a row, each returned focus to the menu button with `aria-expanded="false"` and `#root` no longer `aria-hidden`; `list_console_messages` (warn, error) returned no messages. Before the fix the same Escape close logged the "Blocked aria-hidden" warning quoted above.
- After evidence for the explicit thumbnail focus return (Gallery `flushSync` close plus Lightbox `disableRestoreFocus`), same setup: Escape (after navigating from photo 1 to 22), the Close button, and the backdrop each returned focus to the thumbnail that opened the lightbox with `#root` no longer `aria-hidden`. That held when the lightbox was opened by a programmatic `click()` that left the thumbnail unfocused, as Safari does: photo 5 closed by the backdrop and photo 9 closed by Escape. No console warnings.
- After evidence for the key handling: Alt+ArrowLeft in the open lightbox left the photo at 1 / 22 with the keydown not default-prevented (plain ArrowLeft was prevented and moved to 22 / 22). Holding Enter on a focused thumbnail in headless Chrome (puppeteer `keyboard.down` repeated, so 7 of the 8 keydowns had `repeat: true`) kept the lightbox open on 2 / 22 with Close focused; the build before the fix (2ceb6bf) went open, closed, open, closed across the same 8 keydowns and ended closed.
