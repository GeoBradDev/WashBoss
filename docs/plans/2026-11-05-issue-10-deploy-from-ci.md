# Plan: Deploy production from CI instead of a local gh-pages push (issue #10)

Risk tier: Medium. The change alters how production ships, and the deploy path cannot be exercised by a unit test or before merge (it only runs on push to `main` after the Pages source switch). It touches only CI config, package metadata, static files, and docs: no app code, auth, money, or data.

Domain skills:
- vercel-react-best-practices: not applicable because no React code changes.
- frontend-design: not applicable because no UI changes.
- context7 docs: invoke (used to check `actions/upload-pages-artifact` v5 and `actions/deploy-pages` v5 inputs, read directly from their `action.yml` and release notes).
- All other listed skills (Django, FastAPI, Expo, etc.): not applicable because this is a Vite static site with a GitHub Actions workflow.

## Acceptance criteria

1. `.github/workflows/ci.yml` keeps job id `ci` and name `CI` unchanged, still runs on `pull_request` and on push to `main`, and still runs `npm ci`, `npm run lint`, `npm test`, `npm run build` in that order.
2. A new job `deploy` in the same workflow has `needs: ci`, runs only when the event is `push` or `workflow_dispatch` and the ref is `refs/heads/main` (never on `pull_request`), uses environment `github-pages` with the deployed URL, and deploys with `actions/deploy-pages`.
3. The deployed artifact is the `dist/` built and checked by the `ci` job in the same run (uploaded with `actions/upload-pages-artifact` only on push or dispatch to `main`), so nothing deploys unless lint, test, and build passed.
4. Permissions: workflow default `contents: read`; only the `deploy` job has `pages: write` and `id-token: write`. The `deploy` job has a `concurrency` group `pages` with `cancel-in-progress: false`.
5. `workflow_dispatch` is available so the owner can redeploy `main` without a commit.
6. `gh-pages` is removed from `devDependencies` and `package-lock.json`; the `predeploy` and `deploy` scripts are removed.
7. Root `CNAME` is removed; `public/CNAME` (`washbosspw.com`) is kept and appears in `dist/` after `npm run build`. A Vitest test asserts `public/CNAME` holds exactly `washbosspw.com`.
8. `public/.nojekyll` and root `.nojekyll` are removed. Reason: `actions/deploy-pages` serves the artifact as is with no Jekyll build, and `upload-pages-artifact` v5 drops dotfiles by default, so neither file has any effect (and `public/.nojekyll` never reached production under `gh-pages` either).
9. README: the `npm run deploy` row is removed from the commands table, the Deploying section describes the CI deploy on push to `main`, manual redeploy via "Run workflow", and rollback by reverting on `main`. The CI section mentions the deploy job. No em dashes, no emojis.
10. The full gate passes: `npm ci`, `npm run lint`, `npm test`, `npm run build`.

## Files that change

- `.github/workflows/ci.yml`: add `workflow_dispatch` trigger, a conditional `actions/upload-pages-artifact@v5` step at the end of `ci` (`path: dist`), and the `deploy` job.
- `package.json`, `package-lock.json`: `npm uninstall gh-pages`, delete `predeploy` and `deploy` scripts.
- `CNAME` (root): delete.
- `.nojekyll` (root), `public/.nojekyll`: delete.
- `src/test/cname.test.js` (new): asserts `public/CNAME` content. Pages ignores a CNAME file under an Actions source, so the file and test only record the domain; the live domain is the Pages setting.
- `README.md`: commands table, CI section, Deploying section.
- `docs/plans/2026-11-05-issue-10-deploy-from-ci.md`: this plan.

Not changed: historical plans under `docs/plans/` and `docs/superpowers/` (they record past decisions); `CLAUDE.md` ("deployed to GitHub Pages" stays true).

## Order of work

1. Commit this plan alone.
2. Red: add `src/test/cname.test.js`; it passes already (CNAME exists), so it is a guard, not a defect test. Commit with the CNAME and `.nojekyll` cleanup.
3. Remove `gh-pages` and the deploy scripts; run `npm ci` and the gate.
4. Edit the workflow. Validate with `actionlint` (run from its release binary in the scratch dir, or via docker image `rhysd/actionlint`).
5. README update.
6. Gate: `npm ci`, `npm run lint`, `npm test`, `npm run build`, then `ls -a dist` shows `CNAME` and no `.nojekyll`.

Workflow sketch:

```yaml
on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  ci:
    name: CI
    # unchanged steps, then:
      - if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    name: Deploy
    needs: ci
    if: github.event_name != 'pull_request' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    concurrency:
      group: pages
      cancel-in-progress: false
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

## Risks

- Riskiest step: the first deploy after merge. If the Pages source is still `legacy` when the push run happens, the outcome is uncertain: `deploy-pages` may fail (site stays on `gh-pages`), or, because the protected `github-pages` environment allows `main`, it may succeed and a later legacy build could overwrite it. Mitigation: the orchestrator switches `build_type` to `workflow` before merging; `workflow_dispatch` allows a retry without a new commit.
- Two pushes close together: the `pages` concurrency group serializes deploys but orders them by when each run's `CI` finishes, not by commit, so an older build can land last. Accepted for a single-author repo; "Run workflow" on `main` corrects it.
- Re-running only a failed `Deploy` job needs the Pages artifact, which `upload-pages-artifact` keeps for one day by default.
- Reverting this change on `main` does not switch the Pages source back; the fallback for a broken Actions deploy is switching the source back to the `gh-pages` branch, which is kept until a CI deploy is confirmed live.
- Environment branch policy: `github-pages` currently allows branches `main` and `gh-pages` (read via `gh api`, no writes), so the deploy from `main` is permitted.
- Custom domain: with an Actions source, the domain comes from the Pages setting (currently `cname: washbosspw.com`, HTTPS enforced), not from a file. Keeping `public/CNAME` is harmless and documents the domain.
- PR runs: the upload step and the deploy job are skipped on `pull_request`, so the required `CI` check is unaffected. Branch protection only requires `CI`, so the skipped `Deploy` does not block.
- Fork PRs cannot deploy: deploy is gated on event and ref, and `pull_request` tokens are read-only.

Chosen not to do: no `actions/configure-pages` step (not needed with `base: '/'` and an already enabled site); no separate deploy workflow (`needs:` across workflows is impossible, and the issue asks for same-run gating); no changes to repo or Pages settings, and no deletion of the `gh-pages` branch or its environment branch policy (owner's call after the switch).

## Proof

- Criteria 1 to 5: `actionlint` clean on `ci.yml`; PR run shows `CI` green and `Deploy` skipped; diff review.
- Criterion 6: `npm ls gh-pages` empty; `grep deploy package.json` shows nothing.
- Criteria 7 and 8: `src/test/cname.test.js` passes; `npm run build` then `ls -a dist` shows `CNAME`, no `.nojekyll`.
- Criterion 9: README diff review.
- Criterion 10: full gate output.
- Live drive: not possible before merge. Post-merge, the owner checks the push run's `Deploy` job succeeded, `gh api repos/GeoBradDev/WashBoss/pages` shows `build_type: workflow`, and `https://washbosspw.com` serves the new build over HTTPS.
