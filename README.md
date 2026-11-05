# WashBoss

Marketing site for Wash Boss Pressure Washing, a residential and commercial pressure washing business serving St. Louis, MO. It is a single-page static site built with Vite, React 19, and MUI v9, served from GitHub Pages at [washbosspw.com](https://washbosspw.com).

The page sections live in `src/components/` (Navbar, Hero, TrustBar, Services, About, Gallery with a lightbox, Contact, Footer). The MUI theme is in `src/theme.js`. Static assets, including the gallery photos and the `CNAME` file, are in `public/`.

## Requirements

- Node.js 22.22.2 or newer on the 22 line, 24.15.0 or newer on the 24 line, or 26 and later (the `engines` range in `package.json`). `.nvmrc` pins the 22 line (run `nvm use` to pick it up).
- npm (ships with Node).

## Setup

```sh
npm ci
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run lint` | Run ESLint over the project. |
| `npm test` | Run the Vitest suite once (jsdom and Testing Library) and exit. |
| `npm run build` | Build the production site into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to check a production build. |

Component tests live next to the components they cover (`src/components/*.test.jsx`). Theme tests sit next to `src/theme.js`, and shared test setup and site-wide tests are in `src/test/`.

## Contact form

The contact form posts to [Formspree](https://formspree.io) through `@formspree/react`. The form ID (`xqedwlwr`) is set in the `useForm` call in `src/components/Contact.jsx`. To point the form at a different Formspree form, change that ID. Submissions and notification emails are managed in the Formspree dashboard. The form checks in the browser that a name and a phone number or email are filled in before it sends, and it includes Formspree's hidden `_gotcha` honeypot field; mark `name` as required in the Formspree dashboard so the server enforces it too.

## Continuous integration

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test`, and `npm run build` on every pull request and on pushes to `main`, using the Node version from `.nvmrc`. On `main` only, the same workflow also deploys the site (see Deploying).

## Deploying

Every push to `main` deploys the site from CI. In `.github/workflows/ci.yml`, the `CI` job uploads the `dist/` it just linted, tested, and built as a GitHub Pages artifact, and the `Deploy` job publishes it with `actions/deploy-pages` only after `CI` passes. Pull requests run `CI` but never deploy. The GitHub Pages source must be set to "GitHub Actions".

To redeploy the current `main` without a new commit, run the workflow from the Actions tab ("Run workflow" on `main`). Re-running only a failed `Deploy` job works while its Pages artifact is kept (one day); after that, use "Run workflow".

To roll back, revert the bad commit on `main` (through a pull request, like any other change). The push of the revert deploys the previous version.

The custom domain (`washbosspw.com`) is set in the repository's Pages settings. `public/CNAME` records the same domain and is copied into `dist/` by the build, but Pages ignores it when deploying from Actions.

## Agent workflows

`CLAUDE.md` holds the instructions and gates that coding agents follow when working in this repository.
