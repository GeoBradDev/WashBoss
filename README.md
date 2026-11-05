# WashBoss

Marketing site for Wash Boss Pressure Washing, a residential and commercial pressure washing business serving St. Louis, MO. It is a single-page static site built with Vite, React 19, and MUI v9, served from GitHub Pages at [washbosspw.com](https://washbosspw.com).

The page sections live in `src/components/` (Navbar, Hero, TrustBar, Services, About, Gallery with a lightbox, Contact, Footer). The MUI theme is in `src/theme.js`. Static assets, including the gallery photos and the `CNAME` file, are in `public/`.

## Requirements

- Node.js 22 or newer. The exact major version is pinned in `.nvmrc` (run `nvm use` to pick it up).
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
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch. |

Tests live next to the components they cover (`src/components/*.test.jsx`). Shared test setup is in `src/test/`.

## Contact form

The contact form posts to [Formspree](https://formspree.io) through `@formspree/react`. The form ID (`xqedwlwr`) is set in the `useForm` call in `src/components/Contact.jsx`. To point the form at a different Formspree form, change that ID. Submissions and notification emails are managed in the Formspree dashboard.

## Continuous integration

`.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm test`, and `npm run build` on every pull request and on pushes to `main`, using the Node version from `.nvmrc`.

## Deploying

Deploys are manual. From an up to date `main`:

```sh
npm run deploy
```

This runs the build (`predeploy`) and pushes `dist/` to the `gh-pages` branch with the `gh-pages` package. GitHub Pages serves that branch, and the custom domain comes from `public/CNAME`.

## Agent workflows

`CLAUDE.md` holds the instructions and gates that coding agents follow when working in this repository.
