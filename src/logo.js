// Right-sized square WebP variants of the logo (public/logo-N.webp), so each
// img fetches the smallest file that covers its display size at the device
// pixel ratio. index.html preloads the hero with the same srcset and sizes;
// keep them in step (src/test/logo.test.jsx checks it).
export const LOGO_WIDTHS = [112, 168, 280, 320, 440, 660]

export const logoSrc = (width) => `${import.meta.env.BASE_URL}logo-${width}.webp`

export const logoSrcSet = LOGO_WIDTHS.map((w) => `${logoSrc(w)} ${w}w`).join(', ')

export const NAVBAR_LOGO_SIZES = '56px'
export const FOOTER_LOGO_SIZES = '80px'
// The hero logo is 160px below MUI's md breakpoint (900px) and 220px from it up.
export const HERO_LOGO_SIZES = '(min-width: 900px) 220px, 160px'
