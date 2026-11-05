# WashBoss

Static marketing site: Vite + React 19 + MUI v9, deployed to GitHub Pages.

## Git exception

Granted by the repository owner for /work-issue runs. This scoped exception overrides the
owner's global "never commit / never push" rule only as follows:

- `git commit` and `git push` are allowed only on the `issue-<N>-*` branch created by the
  current /work-issue run, and only to open or update that branch's pull request against `main`.
- Never commit or push to `main`. Never force-push a shared branch or rewrite `main`'s history.
- Never merge your own pull request or enable auto-merge.

## Style rules

- No emojis in code, docs, commits, PRs, or comments.
- No em dashes; use commas, periods, or colons.
- JavaScript only, never TypeScript.

## Gates

Run in this order: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
