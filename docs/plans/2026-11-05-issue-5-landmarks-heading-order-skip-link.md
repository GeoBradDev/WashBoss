# Plan: Landmarks, heading order, skip link, and in-page nav focus (issue #5)

Risk tier: High. Not forced High (no payments, auth, email sending, or data), but it raises one tier for each of: stateful interaction a unit test cannot fully exercise (drawer close, focus after a transition, smooth scroll, breakpoint resize), altering existing behavior (every in-page nav path and the drawer focus return from #2), and touching more than a few files (about 12 source and test files).

Domain skills:
- superpowers:test-driven-development: invoke. Every criterion below gets a failing test first where jsdom can express it.
- chrome-devtools-mcp:a11y-debugging: invoke for the live drive (accessibility tree landmarks and headings, focus, Lighthouse).
- context7-plugin:docs: invoke for MUI v9 `useMediaQuery`, `Typography component`, `ListItemButton` focus-visible class, and `MuiCssBaseline` style overrides, rather than relying on memory.
- vercel-react-best-practices: not applicable because nothing here changes rendering cost, data fetching, or bundle size; it is markup semantics and focus handling.
- frontend-design: not applicable because the visual design must not change (headings keep their variants; the skip link is hidden until focused).
- run: invoke for starting the dev or preview server for the live drive.

## Acceptance criteria

From the issue body and its three comments, made checkable.

1. Lighthouse accessibility audits `landmark-one-main` and `heading-order` pass, on mobile and desktop, against the production build (`npm run build` then `npm run preview`).
2. The accessibility tree shows exactly one each of banner (the AppBar `<header>`), navigation named "Primary" (desktop nav), main, and contentinfo (the footer). Named section regions (see Order of work, step 3) may also appear. Every visible piece of page content is inside a landmark.
3. Heading outline is: one h1 (hero title), one h2 per section (Services "Our Services" or its current text, About, Gallery, Contact), h3 for items under an h2 (service card titles, Contact "Call or Text" and "Service Area"), with no skipped levels and no heading before the first h1. Hero subtitle, About "Firefighter Owned" / "& Operated", About signature "D'Marco Shivers", TrustBar item titles, and the footer business name are not headings (`component="p"`). Every changed element keeps its current `variant` and `sx`; only `component` changes, so the page renders pixel-identical at 375px and 1440px apart from the focus-only skip link.
4. Activating a desktop nav item (Services, About, Gallery, Contact, Get a Free Quote) by mouse or keyboard scrolls to that section, moves focus to that section's h2, and updates the URL hash to the section's `#id` (via `history.pushState`, so it does not jump the page a second time). Desktop nav items are real links: `<Button component="a" href="#services">`, so they can be opened in a new tab or copied. A click with a modifier key (Ctrl, Meta, Shift, Alt) or a non-primary button is left to the browser.
5. Choosing an item from the mobile drawer (including its Get a Free Quote) closes the drawer, scrolls to the section, updates the hash, and, once the drawer's exit transition has finished and the page is no longer `aria-hidden`, moves focus to the target section's h2. If the target heading is not in the document, focus falls back to the hamburger as today.
6. Closing the drawer with Escape or the backdrop still returns focus to the hamburger after the exit transition (unchanged from #2).
7. Edge case at the md breakpoint: if the viewport widens to md or above while the drawer is open, the drawer closes, and focus goes to the first desktop nav link (Services) instead of `<body>`, because the hamburger is hidden at that width. Choosing an item still wins over this fallback.
8. A "Skip to content" link is the first focusable element on the page, is visually hidden until it receives focus, is visible on focus with the theme focus outline, and jumps to `<main id="main">` (which has `tabIndex={-1}` so it receives focus). Copy: "Skip to content".
9. After any in-page nav (desktop link, drawer item, skip link, hero "Get Free Estimate"), the target section's heading is fully visible below the fixed AppBar. Implemented with `scroll-margin-top` on each nav target sized to the AppBar's rendered height (measured in the browser at 375px and 1440px; a shared constant).
10. Smooth scrolling respects `prefers-reduced-motion`: JS scrolls use `behavior: 'auto'` when `(prefers-reduced-motion: reduce)` matches and `'smooth'` otherwise (including when `matchMedia` is unavailable, as in jsdom). Native fragment jumps (skip link) get `html { scroll-behavior: smooth }` only under `@media (prefers-reduced-motion: no-preference)`, via `MuiCssBaseline` style overrides in `src/theme.js`.
11. Drawer nav items (`ListItemButton`) show the same 3px `primary.main` focus outline as other buttons when keyboard-focused, inset so the drawer paper does not clip it (at least 3:1 against the drawer background `#0a0a0a`; `#FF6B00` on it is about 6.4:1). Set in the theme as `MuiListItemButton` `'&.Mui-focusVisible'`.
12. Desktop nav links keep the theme's `.Mui-focusVisible` outline from #4 after becoming anchors.
13. The Contact axe test runs with `heading-order` enabled and passes. Axe `region` is re-enabled in every test that disabled it with an "issue #5" comment, wherever the isolated render allows; each place it stays off has a comment saying why.
14. The hero "Get Free Estimate" button uses the same navigation helper as the nav (scroll, focus the Contact h2, update the hash) and becomes `<Button component="a" href="#contact">` with unchanged look.
15. Unchanged: the logo link and `src/logo.js` (#6), the existing frozen tests in `NavbarDrawerFocus.test.jsx` and `Navbar.test.jsx` (they are not edited and still pass), the Formspree form (never submitted for real).

## Constraints from frozen tests (decision recorded)

- `NavbarDrawerFocus.test.jsx` queries the drawer item as `getByRole('button', { name: 'About' })`, and `Navbar.test.jsx` queries the drawer quote as `getByRole('button', { name: 'Get a Free Quote' })`. So drawer items stay `ListItemButton` buttons (not anchors). They still update the hash with `pushState` and move focus. Desktop nav items become links. If the drawer items must be links too, those two frozen tests need editing, which needs approval.
- `Navbar.test.jsx` "scrolls to the matching section" expects `section.scrollIntoView` to be called synchronously on click with exactly `{ behavior: 'smooth' }`. The helper keeps calling `scrollIntoView` on the section element (not the heading), synchronously, and returns `'smooth'` when `matchMedia` is missing.
- `NavbarDrawerFocus.test.jsx` "(nav item)" renders the Navbar alone with no `#about` in the document, and expects the hamburger to have focus after the drawer closes. Criterion 5's fallback covers this.

## Approvals (user, 2026-11-05, relayed by the orchestrator)

- Plan approved as written at High tier.
- Decision 1: drawer items stay `ListItemButton` buttons (frozen tests query them by role button).
- Decision 2, frozen-test procedure: in the frozen `src/components/Navbar.test.jsx`, only the two axe lines tagged "landmarks are issue #5" may change, and only to strengthen them (turn `region` back on, or keep it off with a comment giving the reason). No other line of an existing test changes. Reason: those lines were placeholders waiting for this issue. Proof that a strengthened line still catches the defect: run it against origin/main in a scratch worktree and record the output under `## Proof` (it should fail on `region` there, or show why it cannot).
- Decision 3: the hero "Get Free Estimate" button goes through the navigation helper.
- Decision 4: widening to md with the drawer open closes the drawer and focuses the first desktop nav link.
- The logo's smooth scroll ignoring reduced motion stays as is (#6), reported only.

## Files that change

- `src/navigation.js` (new): `APPBAR_HEIGHT` constant (measured), `sectionScrollSx` (`{ scrollMarginTop: APPBAR_HEIGHT }`), `prefersReducedMotion()`, `scrollToSection(hash)` (scrollIntoView with the right behavior, returns the element or null), `focusSectionHeading(hash)` (finds the section's `h2[tabindex="-1"]` and calls `focus({ preventScroll: true })`, returns true or false), `setHash(hash)` (`history.pushState(null, '', hash)` when it differs), and `navigateToSection(hash)` composing all three for the non-drawer case. Plus `isPlainLeftClick(event)`.
- `src/App.jsx`: skip link first, then Navbar, then `<Box component="main" id="main" tabIndex={-1} sx={{ outline: 'none', scrollMarginTop }}>` wrapping Hero through Contact, then Footer.
- `src/components/SkipLink.jsx` (new): visually hidden anchor to `#main`, shown on focus with the theme outline; positioned above the fixed AppBar (z-index above `appBar`).
- `src/components/Navbar.jsx`: desktop nav wrapped in `<Box component="nav" aria-label="Primary">`; desktop items `<Button component="a" href>` with an onClick that, for a plain left click, prevents default and calls `navigateToSection`. Drawer items: onClick records the target in a ref, closes the drawer, calls `scrollToSection` and `setHash`; transition `onExited` focuses the target heading if one was recorded and found, else the hamburger if displayed, else the first desktop nav link. The ref is cleared on open and after use. `useMediaQuery(theme.breakpoints.up('md'))` closes the drawer when it becomes true while open, and the same value decides the fallback (first desktop link when true, hamburger when false) and also shows the desktop nav (`display: isDesktop ? 'flex' : { xs: 'none', md: 'flex' }`), so the fallback target is never `display:none` (no visible change in a browser, where the query and the CSS breakpoint agree). Logo untouched.
- `src/components/Hero.jsx`: subtitle `component="p"`; "Get Free Estimate" becomes `component="a" href="#contact"` using `navigateToSection` for plain left clicks.
- `src/components/TrustBar.jsx`: item titles `component="p"`.
- `src/components/Services.jsx`: section `component="section" aria-labelledby`, h2 gets `id` and `tabIndex={-1}`, card titles `component="h3"`, `sectionScrollSx`.
- `src/components/About.jsx`: same section treatment; "Firefighter Owned", "& Operated", and the signature name `component="p"`.
- `src/components/Gallery.jsx`: same section treatment.
- `src/components/Contact.jsx`: same section treatment for both the form state and the success state (the success state has no h2, so `focusSectionHeading` falls back to focusing the section, which gets `tabIndex={-1}` only in that state, or the helper documents the fallback); "Call or Text" and "Service Area" `component="h3"`.
- `src/components/Footer.jsx`: root `component="footer"`; business name `component="p"`.
- `src/theme.js`: `MuiListItemButton` focus-visible outline (inset), `MuiCssBaseline` reduced-motion-aware `scroll-behavior`, and a focus-visible outline for the section headings (either here as a shared style or in `sectionHeadingSx` in `navigation.js`).
- Tests: the new Navbar tests go in a new file, `src/components/NavbarSectionNav.test.jsx`, so the frozen `src/components/Navbar.test.jsx` changes only in the two axe tests' `region` lines, which are #5's own TODOs (see criterion 13). (Departure, made during implementation: the plan first put the new tests inside `Navbar.test.jsx`; a separate file keeps the frozen file's diff to the approved lines.) new `src/test/landmarks.test.jsx` (full `<App />` render: landmarks, heading outline, skip link first in tab order, axe on the full page with `region` and `heading-order` on); `src/components/Contact.test.jsx` axe rules; `Gallery.test.jsx` and `Lightbox.test.jsx` `region` lines; `src/test/focusRing.test.jsx` gets the ListItemButton outline case; a new `src/test/navigation.test.js` for the helper (reduced motion, hash, fallback).

Note on axe context (found during implementation): axe's `region` rule is page-level and is inapplicable when `axe.run` is given a single container element; it only runs when the context is `document` or `document.body`. A probe on origin/main code showed `region` returning no result at all for a container context. So turning `region` back on only means something where the context is `document.body` (isolated renders) or `document` (full page). The Gallery and Contact axe tests therefore move from `container` to `document.body`, and `landmarks.test.jsx` runs on `document` with `document-title` and `html-has-lang` off (both come from `index.html`, which a component render does not load).

Note on the `region` re-enable: Services, About, Gallery, and Contact become `<section aria-labelledby>` (named region landmarks), so isolated renders of Gallery and Contact should pass `region`. Navbar alone renders a `<header>` (banner) and a portal drawer; Lightbox alone is a dialog portal. Try `region` on in each; where axe still fires on an isolated render because the component is never outside `<main>` or a landmark in the real page, leave it off with a comment naming the reason, and cover it with the full-page axe test in `landmarks.test.jsx`.

## Order of work

1. Red tests: `landmarks.test.jsx` (landmarks, heading outline, skip link), Navbar new tests (desktop links are anchors in a nav named Primary; desktop click focuses the h2 and sets the hash; drawer item focuses the h2 after close; Escape and backdrop still go to the hamburger; md resize while open closes and focuses Services; modifier click not prevented), `navigation.test.js`, focusRing ListItemButton case, Contact axe with `heading-order` on. Commit them red, then add the paths of the defect tests to `.claude/fix-lock`.
2. `src/navigation.js` and `src/theme.js`.
3. Heading `component` changes and section wrappers in Hero, TrustBar, Services, About, Gallery, Contact, Footer.
4. `App.jsx` main and skip link.
5. Navbar.
6. Re-enable axe `region` where possible.
7. Full gate, then the live drive.

## Risks

- Drawer focus regression from #2 (aria-hidden blocked focus warning). Mitigation: heading focus only in `onExited`, same as the hamburger; the frozen #2 tests stay green; live drive checks the Chrome console for the "Blocked aria-hidden" warning.
- `useMediaQuery` in jsdom: `window.matchMedia` is undefined, so the hook returns false; the resize test must stub `matchMedia`. The first render on a desktop with SSR off returns the real value (`noSsr` not needed in a client-only app but set it to avoid a false first render that could close nothing; confirm).
- Visual drift: `component` changes must not change margins. MUI Typography resets margin, so the risk is low; screenshots before and after at 375px and 1440px prove it.
- Hash updates with `pushState` and Back: the browser restores scroll; focus is not moved on Back (acceptable, documented in the PR).
- Heading focus outline: a focused h2 shows the theme outline only under `:focus-visible`; on mouse activation Chrome may not show it. That is intended.
- The skip link must sit above the fixed AppBar when shown (`z-index` above `theme.zIndex.appBar`).

Chose not to: change the logo link (#6 freeze), make drawer items anchors (frozen tests), handle initial page load with a hash (out of scope, reported if broken), change heading variants or any copy other than adding "Skip to content".

## Proof

- Criteria 2, 3, 8, 13: `landmarks.test.jsx` (full App), Contact axe test, live accessibility tree snapshot (landmark list and heading outline) via Chrome DevTools.
- Criteria 4, 5, 6, 7, 12, 14: Navbar tests (new) plus frozen #2 tests; live keyboard drives: desktop Tab to a nav link and Enter, drawer at 375px with Enter on an item, Escape and backdrop, resize from 375px to 1440px with the drawer open; `document.activeElement` and `location.hash` recorded after each.
- Criterion 9: live drive measures the target h2's `getBoundingClientRect().top` against the AppBar's bottom after each nav, at 375px and 1440px.
- Criterion 10: `navigation.test.js` with a stubbed `matchMedia`; live drive with reduced motion emulated.
- Criterion 11: focusRing test plus a live screenshot of a keyboard-focused drawer item.
- Criterion 1: Lighthouse accessibility (mobile and desktop) on `npm run preview` before (origin/main) and after, with `landmark-one-main` and `heading-order` results.
- Criterion 3 (visual): screenshots at 375px and 1440px of each section before and after, compared.
- Criterion 15: frozen tests unchanged (`git diff origin/main -- src/components/NavbarDrawerFocus.test.jsx` empty; the Navbar.test.jsx diff only adds tests and the #5 region lines); the live drive stubs `fetch` and never submits the form.
