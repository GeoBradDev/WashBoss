# Plan: Add tests, CI, Node pin, README; fix Drawer slotProps (issue #9)

Risk tier: Medium. Mostly additive tooling and docs, but it also changes existing UI behavior (the mobile Drawer paper styling), touches more than a few files, and the drawer and lightbox are stateful interaction that component tests only partly exercise.

Domain skills:
- superpowers:test-driven-development: invoke (red test for the Drawer defect before the fix; tests for existing paths written and run green).
- context7-plugin:docs: invoke for current Vitest 5 config with Vite 8 and MUI v9 `slotProps.paper`.
- vercel-react-best-practices: not applicable because the only source change is a prop rename on one MUI component, with no rendering, data, or bundle impact.
- frontend-design: not applicable because no visual design changes; the fix restores the already intended styling.

## Scope

In scope (orchestrator decisions): test tooling and tests for paths that work today, the Drawer fix with its regression test, a CI workflow, the Node pin, and a README rewrite.

Out of scope, left to other issues:
- Contact form error-path tests (Formspree error, network error): issue #1 fixes that bug and adds those tests.
- Gallery, lightbox, and menu keyboard-access tests (and any `jest-axe` audit, which would fail today on the unlabeled menu button): issue #2.
- Deploy from CI (`actions/deploy-pages`) and switching the Pages source: a separate follow-up issue the orchestrator will file. No deploy workflow is added.
- Branch protection ("blocks merge on failure"): the orchestrator marks the `CI` check as required after this PR merges.

## Acceptance criteria

1. `npm test` runs Vitest once and exits (no watch mode), with a non-zero exit on any failure.
2. Contact form success path is tested: filling the form and submitting calls the Formspree endpoint for form `xqedwlwr` (fetch is mocked, no real network) and the success message replaces the form.
3. Contact form required-field validation is tested: a mocked Formspree 422 response with a field error for `name` renders the field-level message next to the Name field.
4. Navbar drawer is tested: clicking the hamburger opens the drawer showing all four nav items and the quote button; clicking a drawer item scrolls to the matching section and closes the drawer.
5. Gallery is tested: it renders 22 thumbnails, and clicking one opens the lightbox showing that photo and the `N / 22` counter; the lightbox Close button closes it.
6. `src/components/Navbar.jsx` passes the drawer paper styling through `slotProps.paper` instead of the removed `PaperProps`. A test asserts the drawer paper has width 240px and the theme's `background.default` color, and that no element in the document has a `paperprops` attribute. This test fails on the current code.
7. `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test`, `npm run build` on `pull_request` and on `push` to `main`, with read-only `contents` permission, and passes on this PR.
8. `package.json` has `"engines": {"node": "^22.22.2 || ^24.15.0 || >=26.0.0"}` and the repo has a `.nvmrc` (`22`); CI reads its Node version from `.nvmrc`. The range is the intersection of the new devDependencies' engines (review finding: jsdom 31 needs `^22.22.2 || ^24.15.0 || >=26.0.0`, Vitest 5 needs `^22.12.0 || ^24.0.0 || >=26.0.0`, undici needs `>=22.19.0`), so plain `>=22` would admit unsupported versions. npm engine-strict is not enabled.
9. `README.md` is rewritten: what the project is, Node version, setup, dev/lint/test/build/preview commands, the Formspree form config (where the form ID lives), and the current manual deploy (`npm run deploy` to the `gh-pages` branch). No em dashes, no emojis.
10. `npm run lint` and `npm run build` still pass; no TypeScript files are added.
11. `.gitignore` ignores `.claude/worktrees/`, `eslint.config.js` ignores `.claude/worktrees`, and the Vitest `test.exclude` in `vite.config.js` adds `.claude/worktrees/**` to the defaults so `npm test` in the main checkout never runs worktree tests (verified with `npx vitest list --filesOnly --root <main checkout> --config <this branch>/vite.config.js`, which lists no worktree files; the bare `--root <main checkout>` form reads main's own `vite.config.js`, which has no exclude until this branch merges).
12. The CI job has a stable id `ci` and name `CI` so it can be marked as a required check.

## Files that change

- `package.json`, `package-lock.json`: devDependencies `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`; script `"test": "vitest run"`; `engines`.
- `vite.config.js`: add a `test` block (`environment: 'jsdom'`, `setupFiles`), or a separate `vitest.config.js` if Vitest 5 requires it with Vite 8.
- `src/test/setup.js` (new): `@testing-library/jest-dom/vitest`, RTL `cleanup` after each test, `Element.prototype.scrollIntoView` and `window.scrollTo` stubs (jsdom lacks them).
- `src/test/renderWithTheme.jsx` (new, optional helper): wraps in the app `ThemeProvider` from `src/theme.js`.
- `src/components/Navbar.jsx`: `PaperProps` to `slotProps={{ paper: { sx: { ... } } }}`.
- `src/components/Navbar.test.jsx`, `src/components/Contact.test.jsx`, `src/components/Gallery.test.jsx` (new).
- `.github/workflows/ci.yml` (new), `.nvmrc` (new), `README.md` (rewrite).
  The README also includes short "Continuous integration" and "Agent workflows" sections (review compliance note).
- `eslint.config.js`: add `.claude/worktrees` to `globalIgnores` (and Node globals only if lint needs them for config or test files).
- `.gitignore`: add `.claude/worktrees/` so agent worktrees never show as untracked or get linted from the main checkout (orchestrator addition).
- `CLAUDE.md` (new, written by the orchestrator at the user's direction): scoped git exception for /work-issue, style rules, gate order. Committed with this plan.

## Order of work

1. Install devDependencies, add the `test` script and Vitest config plus setup file. Run `npm test` (no tests yet is acceptable only if Vitest exits 0 with `passWithNoTests`; otherwise go straight to step 2).
2. Write `Navbar.test.jsx` including the slotProps assertions. Run it and record the red output (the styling and `paperprops` assertions fail on current code) under `## Proof`.
3. Fix `Navbar.jsx`. Run the test green.
4. Write `Contact.test.jsx` (success, field validation) and `Gallery.test.jsx`; run green. If any of these paths turns out to be broken on current code, stop and report rather than fixing component code.
5. Add `engines`, `.nvmrc`, `.github/workflows/ci.yml` (job id `ci`, name `CI`), the `.gitignore` and eslint ignores for `.claude/worktrees`.
6. Rewrite `README.md`.
7. Full gate: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
8. Live drive (Medium): `npm run build && npx vite preview`, mobile viewport, open the drawer, confirm 240px width, `background.default` color, no `paperprops` attribute, and that an item navigates and closes the drawer.

## Risks

- Vitest/Vite 8 compatibility: Vitest must be a version that supports Vite 8 as a peer. Riskiest step; check peer ranges before installing.
- jsdom style resolution: emotion injects styles into `<style>` tags; `getComputedStyle` in jsdom applies them, but theme color may come back as `rgb(...)`. Compare against the theme value normalized the same way, or assert on the paper's class rule.
- `@formspree/core` request shape: mock `fetch` generically and assert the URL contains `formspree.io/f/xqedwlwr` rather than the full payload.
- MUI Drawer transitions in jsdom: use `waitFor`/`waitForElementToBeRemoved` for close.
- The hamburger has no accessible name (#2), so tests locate it through the `MenuIcon` test id, not by role name. Do not add an aria-label here; that is #2's change.
- Pre-existing em dashes in `Contact.jsx` user-facing strings are not touched (outside scope).

## Proof

- Criterion 1: `npm test` output, exit code 0, process exits.
- Criteria 2, 3: `Contact.test.jsx`.
- Criteria 4, 6: `Navbar.test.jsx`; red output before the fix recorded here.
- Criterion 5: `Gallery.test.jsx`.
- Criteria 7, 8: CI run on the PR shows all four steps green on the `.nvmrc` Node version.
- Criterion 11: `git check-ignore .claude/worktrees/x` from the main checkout, and `npm run lint` there not walking worktrees.
- Criterion 12: the PR's check list shows `CI`.
- Criteria 9, 10: README review, `npm run lint`, `npm run build`, `find . -name '*.ts*' -not -path './node_modules/*'` empty.
- Live drive: the preview build at mobile width shows the drawer at 240px with the theme background, no `paperprops` attribute in the DOM, and nav works.

### Red output before the Drawer fix (commit f059160)

```
 FAIL  src/components/Navbar.test.jsx > Navbar mobile drawer > styles the drawer paper through slotProps.paper
AssertionError: expected 'auto' to be '240px' // Object.is equality
      Tests  1 failed | 2 passed (3)
```

After changing `PaperProps` to `slotProps.paper` in `Navbar.jsx`: `Tests  3 passed (3)`.
