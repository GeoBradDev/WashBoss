# Plan: Primary CTA buttons and footer text fail WCAG AA contrast (issue #4)

Risk tier: Medium. Theme-wide color change that alters existing look of every contained
primary button, plus hover and keyboard focus states that unit tests in jsdom cannot fully
exercise (real contrast and focus rings need a browser). No money, auth, data, or outward
messaging paths are touched.

Domain skills:
- chrome-devtools-mcp:a11y-debugging: invoke (contrast and focus indicator checks, Lighthouse).
- superpowers:test-driven-development: invoke.
- vercel-react-best-practices: not applicable because no rendering, data, or bundle change.
- frontend-design:frontend-design: not applicable because the brand look is kept; only
  text color, one hover shade, and focus rings change, all decided by the user or the issue.
- django, django-ninja-api, python-fastapi, expo:*: not applicable because this is a Vite
  React static site.

## Decisions already made by the user

- Keep `primary.main` `#FF6B00`. Change `primary.contrastText` to `#0a0a0a`.
- If a hover fails 4.5:1 with the new text, change only the hover background, staying orange.

## Acceptance criteria

1. Lighthouse `color-contrast` reports 0 failures at 375px and 1440px on the production
   preview (`npm run build` then `vite preview`).
2. Every `variant="contained" color="primary"` button meets 4.5:1 text contrast in its
   default and hover states (Navbar desktop and drawer "Get a Free Quote", Hero "Call",
   Contact "Call Now", Contact "Request Free Estimate").
3. The footer copyright text meets 4.5:1 on `#080808`, using a theme token.
4. Every icon button (mobile hamburger, lightbox Previous, Next, Close) and every MUI
   `Button` shows a visible keyboard focus indicator (`:focus-visible` /
   `.Mui-focusVisible`) of at least 3:1 contrast against what is behind it, matching the
   3px `primary.main` outline #14 uses. No element shows two stacked outlines.
5. axe `color-contrast` is no longer disabled for #4 in `src/test/axe.js`; `region` stays
   disabled where it is disabled for #5.
6. `primary.main` used as a focus outline still meets 3:1 on the page backgrounds.

## Measured before (production preview, Lighthouse snapshot mode)

- 375px: color-contrast fails 3 nodes: "Call Now" and "Request Free Estimate" (white on
  `#FF6B00`, 2.85), footer copyright (`#555` on `#080808`, 2.68).
- 1440px: the same plus the desktop "Get a Free Quote" (2.85), 4 nodes.
- The Hero "Call" button is not flagged (Lighthouse cannot resolve its background over the
  radial gradient), but it uses the same colors and is fixed by the same token change.

## Calculated ratios (WCAG relative luminance)

| Pair | Ratio | Need |
| --- | --- | --- |
| `#ffffff` on `#FF6B00` (before) | 2.86 | 4.5 |
| `#0a0a0a` on `#FF6B00` (default, after) | 6.93 | 4.5 |
| `#0a0a0a` on `#B24A00` (MUI computed `primary.dark`, hover) | 3.65, fails | 4.5 |
| `#0a0a0a` on `#E05E00` (proposed explicit `primary.dark`, hover) | 5.44 | 4.5 |
| `#555555` on `#080808` (footer before) | 2.69 | 4.5 |
| `#cccccc` on `#080808` (footer after, `text.secondary`) | 12.47 | 4.5 |
| `#FF6B00` outline on `#0a0a0a` / `#0d0d0d` / `#111111` / `#141414` / `#1a0a00` | 6.93 / 6.81 / 6.61 / 6.45 / 6.76 | 3 |

## Files that change

- `src/theme.js`:
  - `primary.contrastText: '#0a0a0a'`.
  - `primary.dark: '#E05E00'` (MUI uses `palette.primary.dark` as the contained hover
    background; its computed `#B24A00` fails with dark text). `primary.dark` is not used
    anywhere else in `src`.
  - `components.MuiButton.styleOverrides.root['&.Mui-focusVisible']`: `outline: 3px solid`
    `primary.main`, `outlineOffset: 2`.
  - `components.MuiIconButton.styleOverrides.root['&.Mui-focusVisible']`: the same outline
    plus `boxShadow: 0 0 0 2px #0a0a0a` (`background.default`), which fills the 2px offset
    gap with near-black, so the orange ring always sits against a dark band and keeps 6.93:1
    even when the lightbox buttons float over a bright photo.
  - Revision (live drive): `components.MuiButton.defaultProps.disableFocusRipple: true`.
    MUI's keyboard focus ripple is `currentColor` at 0.3 opacity; with near-black text it
    darkens the orange behind the label to about `#B64E03` (3.78:1), or `#A04503` (3.14:1)
    when also hovered. The 3px outline replaces it as the focus indicator. IconButton keeps
    its ripple: it has no text label, and the outline carries the indicator.
  - Do not use MUI v9's global `theme.focusVisible` opt-in: it also restyles
    `ListItemButton` (drawer nav, issue #5) and every `ButtonBase`, which is wider than #4.
    The gallery thumbnails (`ButtonBase`) and logo (`a`) keep their own #14 outlines and are
    not `MuiButton` or `MuiIconButton`, so nothing doubles.
- `src/components/Footer.jsx`: copyright `color: 'text.secondary'`.
- `src/test/axe.js`: remove the `color-contrast` disable and its #4 comment. If axe in jsdom
  reports false color-contrast violations, stop and report rather than re-disabling.
- New `src/theme.test.js`: contrast ratios with MUI's `getContrastRatio` for
  contrastText vs `main` and vs `dark` (>= 4.5), `primary.main` vs `background.default`
  (>= 3), and that the MuiButton and MuiIconButton overrides define a `.Mui-focusVisible`
  outline in `primary.main`.
- New `src/components/Footer.test.jsx`: copyright paragraph's computed color is
  `text.secondary`, and its ratio on `#080808` is >= 4.5.
- New `src/test/focusRing.test.jsx` (revised from "Lightbox or Navbar tests": jsdom
  resolves the emotion styles, so one theme-level test covers every IconButton and Button
  without coupling to a component): a keyboard-focused `IconButton` and contained `Button`
  get `Mui-focusVisible` and a computed 3px solid `primary.main` outline with offset 2px;
  the IconButton also carries the `background.default` box-shadow band; an unfocused
  IconButton has no solid outline. `theme.test.js` therefore checks ratios only.

## Order of work

1. Commit this plan alone.
2. Red: write `src/theme.test.js` and `Footer.test.jsx`, run `npm test`, record the
   failures here under Proof, commit the red tests.
3. Green: theme and footer changes, axe re-enable. Run the full gate.
4. Live drive and Lighthouse after, at 375px and 1440px.

## Risks

- Changing `contrastText` affects every contained primary button, including the disabled
  submit state (MUI disabled colors are separate and exempt from 1.4.3) and the
  `CircularProgress color="inherit"` spinner, which turns near-black on orange (fine,
  higher contrast).
- `primary.dark` might be read by other MUI internals (for example Link hover or
  Slider). None of those components are used in `src`.
- Re-enabling axe `color-contrast` in jsdom may produce `incomplete` results only; that is
  acceptable. Real contrast is proven by Lighthouse.
- Not done: darkening `#FF6B00` (user declined); nav ListItemButton and landmark focus
  (#5); form fields (#3).

## Proof

- AC1: Lighthouse `color-contrast` before and after at 375px and 1440px, snapshot mode.
- AC2: `theme.test.js` ratios; live drive computes the hovered background and text color
  of each contained button in Chrome.
- AC3: `Footer.test.jsx`; Lighthouse.
- AC4: `theme.test.js`; live drive: Tab to the hamburger (375px), Navbar and Contact
  buttons (1440px), and the lightbox Previous, Next, Close, then read computed
  `outline` and `box-shadow` and screenshot each.
- AC5: diff of `src/test/axe.js`; full gate green.
- AC6: ratio table above, asserted in `theme.test.js`.

### Red run (before the fix)

`npx vitest run src/theme.test.js src/components/Footer.test.jsx src/test/focusRing.test.jsx`:
4 failed, 5 passed.

- theme: contrastText on main: `expected 2.8532608695652177 to be greater than or equal to 4.5`
- Footer: `expected 'rgb(85, 85, 85)' to be 'rgb(204, 204, 204)'`
- focusRing IconButton and Button: `expected 'none' to be 'solid'` (outline-style)
- The hover test passes before the fix only because the text is still white (5.42 on the
  computed `#B24A00`). With `#0a0a0a` text and no explicit `primary.dark` it would be 3.65.

### Red run, revision (focus ripple)

`npx vitest run src/test/focusRing.test.jsx`: 1 failed, 3 passed.
`does not pulse a focus ripple over a focused Button label`:
`expected <span ...> to be null` (the `.MuiTouchRipple-ripplePulsate` element exists).
