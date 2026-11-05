// In-page navigation shared by the navbar, the hero, and the skip link.

// Rendered height of the fixed AppBar in px: a 56px logo, 8px Toolbar
// padding above and below, and a 1px bottom border. Measured in Chrome at
// 375px and 1440px. Nav targets use it as scroll-margin-top so their
// heading lands below the AppBar.
export const APPBAR_HEIGHT = 73

export const sectionScrollSx = { scrollMarginTop: `${APPBAR_HEIGHT}px` }

export function prefersReducedMotion() {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Scrolls the section for `hash` (like "#about") into view, smoothly unless
// the user asked for reduced motion. Returns the section, or null.
export function scrollToSection(hash) {
  const section = document.querySelector(hash)
  if (!section) return null
  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  return section
}

// Focuses the section's h2 (or the section itself when it has no h2 and is
// focusable, as in the contact success state) without scrolling, so the
// scroll above is not interrupted. Returns whether anything took focus.
export function focusSectionHeading(hash) {
  const section = document.querySelector(hash)
  if (!section) return false
  const target = section.querySelector('h2[tabindex="-1"]')
    ?? (section.getAttribute('tabindex') === '-1' ? section : null)
  if (!target) return false
  target.focus({ preventScroll: true })
  return document.activeElement === target
}

// Records the section in the URL without a second jump.
export function setHash(hash) {
  if (window.location.hash !== hash) window.history.pushState(null, '', hash)
}

export function navigateToSection(hash) {
  scrollToSection(hash)
  setHash(hash)
  focusSectionHeading(hash)
}

// A click the page may take over. Modified and non-primary clicks (new tab,
// new window, download) are left to the browser.
export function isPlainLeftClick(event) {
  return event.button === 0
    && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
}
