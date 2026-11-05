# Plan: Contact form never shows an error when submission fails (issue #1)

Risk tier: Medium. The change alters existing behavior of stateful, async UI (the alert depends on `useForm` state across submit and retry) in one component and its test file. Not forced High: the diff changes only how a failed result is rendered; it does not touch the Formspree form id, the `useForm` call, the `onSubmit` wiring, or what is sent, so the email-sending path is unchanged. Starts Low, +1 stateful async UI, +1 altering existing behavior.

Domain skills:
- superpowers:test-driven-development: invoke (red test first, then fix).
- chrome-devtools-mcp:chrome-devtools: invoke for the live drive against `vite preview`, with every request to formspree.io intercepted.
- vercel-react-best-practices: not applicable because the change is a render condition with no data fetching, memoization, or bundle impact.
- frontend-design: not applicable because no visual design changes; the existing MUI `Alert` is reused.
- All other listed skills (Django, FastAPI, Expo, etc.): not applicable because this is a Vite React static site.

## Findings from the real library (node_modules)

`@formspree/react` 3.0.0 with `@formspree/core` 4.0.0:

- `state.errors` is `null` or a `SubmissionError` object with `getFormErrors()`, `getFieldErrors(field)`, `getAllFieldErrors()`. It has no `length`, so the current `state.errors.length > 0` check is always false. Confirmed.
- `submitForm` never throws for a request failure. It catches any error from `fetch` or `response.json()` and returns `new SubmissionError({ message: err.message })`, which is one form-level error with code `UNSPECIFIED` (for example `"Failed to fetch"`).
- The HTTP status is ignored. Only the JSON body decides: `{ errors: [...] }` becomes a `SubmissionError` (entries without `field` are form errors, entries with `field` are field errors); `{ error: "..." }` becomes one form error; any other object becomes the form error `"Unexpected response format"`; a non-JSON body (an HTML 5xx page) makes `json()` throw and becomes a form error.
- `useForm` keeps `errors` set while a retry is submitting and replaces it only when the next result arrives.
- `ValidationError` renders a plain `div` with no role, so field errors are not announced to screen readers.
- MUI `Alert` defaults to `role="alert"`.

## Decision: field-only 422 also shows the general alert

The alert shows whenever the last submission failed (`state.errors` is not null), not only when there are form-level errors. Evidence:

1. Only `name` and `message` render inline `ValidationError`s. A Formspree field error for `phone`, `address`, or `service` (for example a dashboard rule producing `TYPE_NUMERIC` or `REQUIRED_FIELD_MISSING`) would otherwise give no feedback at all, which is the bug this issue describes.
2. The inline `ValidationError` has no role or live region, so a field-only failure is otherwise silent for screen reader users.
3. In every case the request was not sent, which is what the alert says. The inline field message still says which field to fix.

## Acceptance criteria

1. With the network failing (fetch rejects), submitting shows the error alert, and the alert text includes the phone fallback `(636) 614-8371`.
2. A Formspree error response with form-level `errors` (a 4xx such as 403 `INACTIVE`, and a 5xx) shows the error alert. A 5xx with a non-JSON body also shows it.
3. The alert has `role="alert"`. It is unmounted while a retry is submitting, so each new failure mounts it again and is announced again.
4. After a failure the user's entered values (name, phone, address, details, and the selected service) are still in the form, and the submit button is enabled for a retry.
5. A field-only 422 (`errors` with `field: "name"`) shows the inline `Name should be filled out` in the Name cell (existing test unchanged) and also the general alert.
6. The success path is unchanged: the existing success test passes and no alert renders on success.
7. No fields, validation, or `required` behavior change (issue #3's scope). The form id `xqedwlwr` and the submit wiring are unchanged.
8. Gate passes: `npm ci`, `npm run lint`, `npm test`, `npm run build`.

## Files that change

- `src/components/Contact.jsx`: replace the alert condition with `state.errors && !state.submitting`; change the alert copy to `Your request was not sent. Please try again, or call us directly at (636) 614-8371.` (no em dash, keeps the phone fallback, tells the user the retry is possible). The explicit `role="alert"` is added for clarity even though it is MUI's default. Nothing else in the file changes.
- `src/components/Contact.test.jsx`: new tests (below). The two existing tests are not edited.
- `docs/plans/2026-11-05-issue-1-contact-form-error-alert.md`: this plan.

Not changed: README (does not describe the form's error behavior), `CLAUDE.md`.

## Order of work

1. Commit this plan alone: `docs: plan for issue 1`.
2. Red: add the new tests to `Contact.test.jsx`, run `npm test`, confirm the new ones fail for the right reason (no alert found), commit as `test: failing tests for contact form error alert (#1)`. Freeze them.
3. Green: change `Contact.jsx`, run the full gate, commit as `fix: show contact form error alert on failed submission (#1)`.
4. Live drive (below), then review, verify, ship.

## Tests (in `Contact.test.jsx`)

A helper `mockFetchReject(error)` stubs `fetch` with `vi.fn().mockRejectedValue(error)`; a helper for a raw body response covers non-JSON 5xx. Each test fills Name, Phone, Address, Details, and selects a service where it checks preservation.

- network failure: fetch rejects `new TypeError('Failed to fetch')`: `findByRole('alert')` contains `(636) 614-8371`; the button `Request Free Estimate` is enabled; all entered values remain (`toHaveValue`, and the service select shows the chosen option).
- 5xx with form-level errors: 500 `{ errors: [{ message: 'Internal error' }] }`: alert shown.
- 4xx with form-level errors: 403 `{ errors: [{ code: 'INACTIVE', message: 'Form not active' }] }`: alert shown.
- 5xx with non-JSON body: 502 `text/html` body: alert shown.
- field-only 422: alert shown in addition to the inline Name message.
- retry: first submit rejects, alert shows; second submit is a pending promise: the alert is gone while submitting; resolve it with success and the success message shows.
- success: existing test, plus no `role="alert"` on the page after success is covered by the success test's existing assertions on the replaced view (no new edit to it).

## Risks

- Riskiest step: the "hide while submitting" condition. If wrong, the alert could flicker or never show. The retry test covers it.
- MUI `TextField select` value check: the select renders a hidden input with `name="service"`; the test reads the visible combobox text instead.
- Changing copy: kept short, keeps the phone number, no em dash.
- Chosen not to do: rendering Formspree's own form-level message (`ValidationError` with no field). Its texts are technical (`Failed to fetch`, `Unexpected response format`) and would confuse customers; the fixed copy plus the phone number is clearer.

## Proof

- Criteria 1 to 5: the new tests above. Criterion 6: the existing success test. Criterion 7: diff review. Criterion 8: gate output.
- Live drive (`npm run build && npx vite preview`, Chrome DevTools): every request to `formspree.io` is intercepted in-page (a `window.fetch` override installed before submit) so no real submission is sent. Drive (a) fetch rejects, (b) 500 with `errors`, (c) 403 with form-level `errors`, (d) stubbed success. For each: screenshot or a11y snapshot showing the alert with role alert and the phone number, entered data still present, and for (d) the success message. Network log confirms no request reached formspree.io.
