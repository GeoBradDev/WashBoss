# Plan: Contact form accepts submissions with no way to reach the customer (issue #3)

Risk tier: High. Forced: the change adds fields (`email`, `_gotcha`) to the Formspree payload that sends real email to the business, and changes when that email is sent. Without the forced rule it would still be Medium or High: stateful interactive UI, altered existing behavior (empty submits stop sending), and a changed payload contract.

Domain skills:
- superpowers:test-driven-development: invoke (red tests first, then the fix).
- chrome-devtools-mcp:chrome-devtools: invoke for the live drive against `vite preview`, with `fetch` stubbed before the page loads.
- chrome-devtools-mcp:a11y-debugging: invoke for the live drive (accessible names, descriptions, `aria-invalid`, focus order, honeypot absent from the a11y tree).
- vercel-react-best-practices: invoke, light touch: validation errors are derived from state during render, not synced with an effect.
- frontend-design: not applicable because no visual redesign; existing MUI `TextField` props (`error`, `helperText`) are reused, and the only layout change is one new grid cell.
- context7 (Formspree docs): already consulted in planning, see below. The implementer does not need to repeat it.
- All other listed skills (Django, FastAPI, Expo, Claude API, etc.): not applicable because this is a Vite React static site.

## Findings from the real library and docs

`@formspree/react` 3.0.0 (`node_modules/@formspree/react/dist/index.mjs`):

- `handleSubmit(eventOrData)` accepts either a submit event or a `FormData`/object. For an event it calls `preventDefault()` and builds `new FormData(event.currentTarget)` synchronously, before its first `await`, so calling `handleSubmit(event)` synchronously from our own `onSubmit` handler works. `currentTarget` is null after an `await`, so our handler must not `await` before calling it.
- `state.errors` is null or a `SubmissionError`; `state.submitting`, `state.succeeded` as before. Client-side validation never calls `handleSubmit`, so it leaves `state` untouched: no request, no general alert.

Formspree docs (help.formspree.io, "Honeypot spam filtering", via context7 and the site):

- The field name is exactly `_gotcha`. "If the `_gotcha` field is filled in, we take that as a sign that a bot has submitted the form, and we silently ignore the submission."
- The docs say to hide it with CSS and recommend a class over an inline style. An empty `_gotcha` is ignored and the submission is processed normally.

## Acceptance criteria

1. An empty form, or one without phone or email, cannot be submitted: no request is sent (`fetch` is not called). Inline errors appear via MUI `error` and `helperText`:
   - Name empty or whitespace only: Name shows `Enter your name.`
   - Phone and Email both empty or whitespace only: both fields show `Enter a phone number or an email. Either one is enough.`
   - Email filled but not a basic `local@domain.tld` shape: Email shows `Enter a valid email address, like name@example.com.` (this blocks submit even when Phone is filled).
2. The errors are announced to screen readers: each invalid input has `aria-invalid="true"` and its error text as its accessible description (MUI `helperText` wiring through `aria-describedby`), and after a failed submit, focus moves to the first invalid field in form order (Name, Phone, Email), so its label, invalid state, and error are read.
3. After a failed client-side submit, errors update as the user types: fixing a field clears its error without another submit. Before the first submit attempt, no errors show.
4. A new Email field exists: `type="email"`, `autoComplete="email"`, label `Email`.
5. Every contact field has an `id`, a `name`, and an autocomplete token: Name `id="contact-name"`, `name="name"`, `autoComplete="name"`; Phone `id="contact-phone"`, `name="phone"`, `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`; Email `id="contact-email"`, `name="email"`, `type="email"`, `autoComplete="email"`; Address `id="contact-address"`, `name="address"`, `autoComplete="street-address"`; Service `id="contact-service"`, `name="service"`; Details `id="contact-message"`, `name="message"`. In a live Chrome load, the Issues panel or console reports no "autocomplete attribute" and no "id or name attribute" issue for the form.
6. A Formspree honeypot `<input type="text" name="_gotcha" id="contact-gotcha">` is in the form, hidden by a CSS class (MUI `sx`, `display: none`), with `tabIndex={-1}`, `aria-hidden="true"`, and `autoComplete="off"`. It is not in the accessibility tree, not reachable by Tab, and not visible. It is sent with an empty value on a normal submission.
7. A valid submission (Name plus Phone, or Name plus a valid Email) posts once to `formspree.io/f/xqedwlwr` with `name`, `phone`, `address`, `service`, `message`, `_gotcha`, and `email` only when filled (trimmed) in the body, and shows the existing success message.
8. Existing behavior from #1 is kept: any submission error shows the general alert with the copy `We could not confirm your request was received. Please try again, or call us directly at (636) 614-8371.`, hidden while a retry submits; Formspree 422 field errors still render inline next to Name (and Message). Client-side validation failures do not show that alert.
9. The Contact section has no axe violations, both in its initial state and with the inline errors showing.
10. Gate passes: `npm ci`, `npm run lint`, `npm test`, `npm run build`. The form id `xqedwlwr` is unchanged. New copy has no emojis and no em dashes. Existing copy is untouched.

## Files that change

- `src/components/Contact.jsx`:
  - Add controlled state for `name`, `phone`, `email` (one `values` object or three `useState`s), and a `showErrors` boolean set to true on the first failed submit attempt.
  - A pure `validateContact({ name, phone, email })` function at module scope returning `{ name?, phone?, email? }` messages per criterion 1. Email check: trimmed value matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Errors are derived during render: `const errors = showErrors ? validateContact(values) : {}`. No `useEffect`.
  - `onSubmit(event)`: compute `validateContact(values)`; if any error, `event.preventDefault()`, `setShowErrors(true)`, focus the first invalid input (refs via `inputRef`, order Name, Phone, Email), return. Otherwise call `handleSubmit(event)` synchronously (see Findings). The `<form>` keeps `noValidate` (explicit validation is the chosen path, per the issue's "do not do neither").
  - Fields per criterion 5. Name keeps `required` (asterisk and `aria-required`). Phone and Email are not marked `required`; each gets the default helper text `Phone or email required.` when it has no error, so the rule is visible and in the accessible description before any submit. Each `TextField` gets `error={Boolean(errors.x)}` and `helperText={errors.x ?? default}`.
  - Layout: Name full width (`size={12}`), then Phone and Email side by side (`size={{ xs: 12, sm: 6 }}` each), then Address, Service, Details as now. Grouping Phone and Email shows the either-or rule.
  - Honeypot per criterion 6, inside the form, outside the visible grid flow, via `<Box component="input" ... sx={{ display: 'none' }} />` so the hiding is a generated class, not an inline style.
  - Existing `ValidationError` elements for `name` and `message` stay. The general alert block and its copy are unchanged.
- `src/components/Contact.test.jsx`: new tests (below), plus the two-test edit described under "Needs approval".
- `README.md` (Phase 8 only, if its text becomes incomplete): the "Contact form" section may gain one sentence that the form requires Name and a phone or email client-side, includes a `_gotcha` honeypot, and that matching required fields are set in the Formspree dashboard.
- This plan.

Not changed: `@formspree/react` version, the form id, success copy, error alert copy, `SERVICE_TYPES` (its existing "Not Sure" option text is existing copy and stays as is), `CLAUDE.md`.

## Approved: rewrite of two existing tests that submit an empty form

Approval: the user approved the plan as written (High tier, no phone format check, success message unchanged) and explicitly approved rewriting both tests below, through the coordinator, on 2026-11-05.

Two existing tests click submit on a completely empty form and rely on a request going out so the mocked 422 comes back:

- `shows the field-level error next to Name when Formspree rejects an empty name` (line 68, from #11).
- `shows the general alert as well as the inline message for a field-only 422` (line 146, from #1, frozen).

Criterion 1 makes that request impossible, so both fail by design once the fix lands. Approved rewrite: before clicking submit, type a valid Name and Phone (`Test Customer`, `5555550100`), keep the same 422 mock and every existing assertion, and rename them to drop "an empty name" (for example `shows the field-level error next to Name when Formspree rejects the name`). They then still prove what they were written for: a server-side 422 field error renders inline in the Name cell, and (for #1's test) the general alert shows too. That server path stays reachable in production through the Formspree dashboard's required-field and type rules.

Proof that the rewritten #1 test still catches its defect: in a scratch worktree at `7738c05^` (before #1's fix), apply only the rewritten test and confirm it fails because no alert is found. Record that output under `## Proof`.


### Approved: second rewrite, blank email left out of the payload (review round 1)

Approval: the user approved this second rewrite on 2026-11-05, through the coordinator. Reason: Formspree treats a field named `email` as the reply-to address and validates it, and its docs do not say whether an empty value is rejected, so a blank `email` could block phone-only leads. The frozen test `submits with a name and phone only and sends an empty email and honeypot` is renamed `submits with a name and phone only and sends no email and an empty honeypot`, and its assertion `expect(body.get('email')).toBe('')` becomes `expect(body.has('email')).toBe(false)`. Nothing else in that test changes. Proof is under `## Proof`.

## Review round 1 fixes

- B: a submit blocked in the browser after a failed Formspree request left `state.errors` set, so the old general alert and old inline 422 text stayed next to the new client errors. `onSubmit` now calls `useForm`'s third return value, `reset`, when the browser check fails. Tests: network failure then a blocked submit shows no `role="alert"`, the either-or error, and one fetch in total; a 422 on `name` then a blocked submit removes `Name should be filled out`.
- C: `ValidationError` for `phone` (prefix `Phone`) and `email` (prefix `Email`) in their grid cells, so a Formspree 422 on those fields renders inline. Tests for both.
- D and H: after validation passes, `onSubmit` builds `new FormData(event.currentTarget)`, calls `event.preventDefault()`, deletes `email` when its trimmed value is blank or sets it to the trimmed value, and calls `handleSubmit(data)` (the library accepts `FormData`; `I(e)?$(e):e` in `@formspree/react` dist). `validateContact` trims with `String.prototype.trim`, which strips U+00A0, but the raw value used to be sent. Test: `test@example.com` followed by U+00A0 is sent as exactly `test@example.com`.
- G (tests only): a whitespace-only Name with a valid phone is blocked with `Enter your name.`; the honeypot is skipped by Shift+Tab from Name and by Tab from the element before the form (the `Call Now` link), checked against a local mutation that removes `display: none` and `tabIndex`.
- README: the Contact form sentence also says a malformed email blocks the submit and a blank email is left out of the request.

## Order of work

1. Commit this plan alone: `docs: plan for issue 3`.
2. Rewrite the two tests (above), run the pre-#1 proof, commit as `test: submit valid contact details in Formspree 422 tests (#3)`.
3. Red: add the new tests, run `npm test`, confirm each new test fails for the expected reason (no Email field, no inline error, `fetch` called, missing attributes), commit as `test: failing tests for contact form validation and autofill (#3)`, append the file to `.claude/fix-lock`.
4. Green: change `Contact.jsx`, rerun until green, `rm .claude/fix-lock`, run the full gate, commit as `fix: require name and a phone or email on the contact form (#3)`.
5. Live drive (below).

## Tests (new, in `Contact.test.jsx`)

Use `vi.stubGlobal('fetch', vi.fn())` in each validation test and assert it was not called. Fake data only: `Test Customer`, `5555550100`, `test@example.com`.

- empty submit: no fetch; Name, Phone, Email each `toBeInvalid()` (aria-invalid) and `toHaveAccessibleDescription` matching their error; Name has focus; no `role="alert"` element.
- name only: no fetch; Phone and Email show the either-or error; focus on Phone.
- name plus whitespace-only phone and email: treated as empty.
- phone and email but no name: no fetch; only Name errors; focus on Name.
- invalid email (`not-an-email`) with name and phone filled: no fetch; Email shows the format error; focus on Email.
- errors clear while typing after a failed submit: submit empty, type a name, the Name error is gone and its default (none) restored; type a phone, Phone and Email errors are gone.
- no errors before the first submit: `aria-invalid` absent on all fields, Phone and Email described by `Phone or email required.`
- valid with email only (name plus `test@example.com`): one POST to `formspree.io/f/xqedwlwr`, success message shown, body `FormData` has `email` equal to `test@example.com` and `_gotcha` equal to `''`.
- valid with phone only: a new test (name plus `5555550100`) asserting one POST and the body's `phone` equal to `5555550100`, `email` equal to `''`, and `_gotcha` equal to `''`. The existing success test is not edited.
- attributes: each field's `id`, `name`, `type`, `inputMode`, `autocomplete` per criterion 5, read from the DOM.
- Departure (found in the live drive, item 8): Chrome's Issues reported one "A form field element should have an id or name attribute". The element is the `aria-hidden` shadow `<textarea>` that MUI 9's `TextareaAutosize` renders for every `multiline` field (Additional Details), which has no id or name and cannot be given one through props. Added test: every `input`, `textarea`, and `select` inside the form has an id or a name (red first). Fix: render Details with `slotProps={{ input: { inputComponent: 'textarea' } }}` and `rows={4}`, a plain textarea with no shadow element; it still has four rows and the multiline styles, but no longer auto-grows (it never did with a fixed `rows`).
- honeypot: `container.querySelector('input[name="_gotcha"]')` exists with `id="contact-gotcha"`, `tabindex="-1"`, `aria-hidden="true"`, `autocomplete="off"`, and is `not.toBeVisible()`; it is not returned by `getAllByRole('textbox')`; tabbing through the form from Name never lands on it.
- axe: `axeViolations` on the rendered Contact section is `[]`, before submit and after an empty submit.
  - Departure (found while writing the red tests): axe on the Contact section alone reports `heading-order` on the existing `h4` "Call or Text" and `h6` "Service Area" (the section jumps from `h2` to `h4`). It predates #3 and changing headings is outside this issue, so the axe test disables `heading-order` (and `region`, as the other component axe tests do) with a comment. Criterion 9 is read as "no axe violations introduced by #3".

Existing tests stay unchanged except the two above. The general alert tests from #1 already fill Name and Phone through `fillForm`, so they still send a request.

## Risks

- Riskiest step: calling `handleSubmit(event)` after our own checks. If our handler awaited anything first, `event.currentTarget` would be null and Formspree would throw `submit was triggered for a non-form element`. The handler stays synchronous; the success and failure tests cover it.
- Switching Name, Phone, Email to controlled inputs: the #1 tests assert values stay after a failed request. Controlled state keeps them; those tests cover it.
- Email regex too strict would block real customers. The chosen check only requires one `@`, no spaces, and a dot in the domain. Formspree does its own checks server-side.
- Focus moving on failed submit could surprise sighted users; it is the standard pattern for WCAG 3.3.1 and only happens on a submit attempt.
- Honeypot: `display: none` keeps it out of the a11y tree, the tab order, and Chrome autofill. Some bots skip `display: none` fields; the docs' class-based hiding is used, and Formspree also runs its own spam filtering.
- The payload gains `email` and `_gotcha`. The business's notification email will show these new keys. `_gotcha` is a Formspree special field and is not shown in submissions.

Chosen not to do:
- Phone format validation (digit count): not requested. Any non-blank phone counts.
- Changing the success message to echo the contact method (mentioned in the issue body, not in its acceptance criteria).
- Server-side required fields in the Formspree dashboard: the user's account settings, listed as a manual follow-up in the PR body (Name only; the dashboard cannot express phone-or-email).
- Removing `noValidate` in favor of native validation: native bubbles are not consistent across browsers and cannot express "phone or email".

## Proof

- Criteria 1 to 3: the validation tests. Criterion 4 and 5: the attribute test, plus the live Chrome Issues check. Criterion 6: the honeypot test, plus the live a11y snapshot. Criterion 7: the email-only and phone-only success tests and the existing success test. Criterion 8: the existing #1 tests (unchanged) and the two rewritten 422 tests. Criterion 9: the axe test. Criterion 10: gate output and diff review.
- Live drive (High: changed path plus failure and edge paths). `npm run build && npx vite preview` from the worktree, Chrome DevTools MCP. Before the page loads (`navigate_page` with an init script, or `evaluate_script` registered before load as #1 did), override `window.fetch` so any request to `formspree.io` returns a stubbed response and is never sent; the network log must show no request to `formspree.io`. Drive and capture:
  1. Empty submit: a11y snapshot showing `invalid` on Name, Phone, Email with their descriptions, focus on Name, and the stub's call counter at 0.
  2. Name only: either-or error on both Phone and Email; counter 0.
  3. Invalid email plus phone: Email format error; counter 0.
  4. Fix the fields live and watch errors clear.
  5. Valid submit with phone, stubbed 200: success message; the stub recorded one call with `email` and empty `_gotcha` in the body.
  6. Stubbed network failure on a valid form: the #1 general alert shows.
  7. Mobile emulation (for example 390x844, touch): DOM shows `type="tel"` and `inputmode="tel"` on Phone, `type="email"` on Email, and the autocomplete tokens on every field.
  8. Chrome Issues panel or console on page load: no autocomplete or id/name issue for the form (capture what the tool reports; if the MCP cannot read the Issues panel, say so and report the DOM attribute evidence instead).
  9. Honeypot: absent from the a11y snapshot, not focused by tabbing through the form, computed `display: none`.
  10. Network log for the whole drive: no request to `formspree.io`.

Manual follow-up for the user (PR body): in the Formspree dashboard for form `xqedwlwr`, mark `name` as required. The phone-or-email rule is enforced in the browser only. Formspree's docs show per-field validation only (`required`, `type`, `min`, `max`, `minlength`, `maxlength`, `accept` in the field rules), and its Form Rules test one field per condition and can only send an email, tag as spam, or redirect; none of them rejects a submission or combines two fields, so the server cannot require "phone or email".

### Pre-#1 proof for the rewritten 422 test (recorded 2026-11-05)

Scratch worktree at `7738c05^` (2082be1, before #1's fix), `npm ci`, then `src/components/Contact.test.jsx` replaced with only the rewritten test `shows the general alert as well as the inline message for a field-only 422` (with its `mockFetchResponse` and `submitButton` helpers). Name and Phone are typed (`Test Customer`, `5555550100`) before submit, the 422 mock and both assertions are unchanged.

```
git worktree add --detach <scratchpad>/proof-1 7738c05^
cd <scratchpad>/proof-1 && npm ci
npx vitest run src/components/Contact.test.jsx

 ❯ src/components/Contact.test.jsx (1 test | 1 failed) 255ms
       × shows the general alert as well as the inline message for a field-only 422 255ms
 FAIL  src/components/Contact.test.jsx > Contact form > failed submission > shows the general alert as well as the inline message for a field-only 422
TestingLibraryElementError: Unable to find an accessible element with the role "alert"
 ❯ src/components/Contact.test.jsx:40:21
     39|       expect(await screen.findByText('Name should be filled out')).toB...
 Test Files  1 failed (1)
      Tests  1 failed (1)
```

The inline `Name should be filled out` assertion (line 39) passes, so the request still goes out and the 422 comes back; the test fails only on the missing general alert, which is #1's defect. The scratch worktree was then removed with `git worktree remove --force`.

### Proof for the second approved rewrite (recorded 2026-11-05)

The rewritten test run against the production code at 5d23f86, before the round 1 fix:

```
npx vitest run src/components/Contact.test.jsx -t 'sends no email and an empty honeypot'

       × submits with a name and phone only and sends no email and an empty honeypot 357ms
 FAIL  src/components/Contact.test.jsx > Contact form > client-side validation (#3) > submits with a name and phone only and sends no email and an empty honeypot
AssertionError: expected true to be false // Object.is equality
    384|       expect(body.has('email')).toBe(false)
      Tests  1 failed | 21 skipped (22)
```

It fails because the body still contains `email` (empty), which is what the fix changes.
