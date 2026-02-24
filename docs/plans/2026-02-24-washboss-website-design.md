# Wash Boss Pressure Washing — Website Design

**Date:** 2026-02-24
**Owner:** D'Marco Shivers
**Business:** Wash Boss Pressure Washing LLC, St. Louis MO
**Phone:** 636-614-8371

---

## Overview

Single-page business website for Wash Boss Pressure Washing LLC. Deployed on GitHub Pages via GitHub Actions. Built with React 19 + Vite + MUI v6.

---

## Tech Stack

- **Framework:** React 19 + Vite 8
- **UI Library:** MUI (Material UI) v6 — custom theme matching brand colors
- **Forms:** Formspree (free tier) — no backend required
- **Deployment:** GitHub Pages via `gh-pages` package or GitHub Actions

---

## Brand Colors (from logo)

| Name        | Hex       | Usage                          |
|-------------|-----------|--------------------------------|
| Background  | `#0a0a0a` | Page/section backgrounds       |
| Primary     | `#FF6B00` | Orange — CTAs, headings, icons |
| Accent      | `#1E9FD4` | Water blue — accents, badges   |
| White       | `#FFFFFF` | Body text, card backgrounds    |
| Gray        | `#CCCCCC` | Secondary text                 |

---

## Page Structure (single scroll)

### 1. Navbar
- Logo (SCSL.jpeg) on the left
- Smooth-scroll nav links: Services | About | Gallery | Contact
- "Get a Free Quote" CTA button (orange, right side)
- Sticky on scroll, dark background

### 2. Hero
- Full-width dark section
- Logo centered and prominent
- Headline: bold, impactful (e.g. "St. Louis's Premier Pressure Washing Experts")
- Subheadline: short tagline mentioning firefighter-owned, licensed & insured
- Two CTAs: "Call Now" (tap-to-call) + "Get Free Estimate" (scrolls to contact)

### 3. Trust Bar
Three icon badges displayed horizontally:
- Firefighter Owned & Operated
- Licensed & Insured
- Free Estimates

### 4. Services
Four MUI Cards in a responsive grid (2x2 on desktop, 1 column on mobile):
1. Pressure Washing
2. Soft Washing
3. Concrete Sealing
4. Paver Sealing

Each card: icon, title, short description. Note at bottom: "Serving Residential & Commercial Properties"

### 5. About
Split layout (50/50 on desktop, stacked on mobile):
- Left: Firefighter badge/icon or themed visual element, orange accent
- Right: D'Marco's story — firefighter background, commitment to quality, licensed & insured, pride in work
- Strong emphasis on firefighter-owned angle as differentiator

### 6. Gallery
3x2 placeholder grid of image cards. Each card shows a styled placeholder with "Photo Coming Soon" text. Easy to swap in real job photos later by replacing placeholder with `<img>` tags.

### 7. Contact
Two-column layout (stacked on mobile):
- **Left:** Phone number large and prominent, tap-to-call button, service area (St. Louis, MO and surrounding areas)
- **Right:** Formspree contact form with fields: Name, Phone, Address, Service Type (dropdown), Message, Submit button

### 8. Footer
- Logo
- Phone number
- Tagline
- Copyright: "© 2025 Wash Boss Pressure Washing LLC. All rights reserved."

---

## Deployment

- `vite.config.js` must set `base` to the GitHub Pages repo path (e.g. `/washboss/`)
- Use `gh-pages` npm package with a `deploy` script in `package.json`
- Or use GitHub Actions workflow to build and deploy on push to main

---

## File Structure

```
src/
  components/
    Navbar.jsx
    Hero.jsx
    TrustBar.jsx
    Services.jsx
    About.jsx
    Gallery.jsx
    Contact.jsx
    Footer.jsx
  theme.js          # MUI custom theme
  App.jsx           # Assembles all sections
  main.jsx
public/
  SCSL.jpeg         # Logo
```