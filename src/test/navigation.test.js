import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  prefersReducedMotion,
  scrollToSection,
  focusSectionHeading,
  setHash,
  navigateToSection,
  isPlainLeftClick,
} from '../navigation'

function stubReducedMotion(reduce) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}

function addSection(id, { heading = true } = {}) {
  const section = document.createElement('section')
  section.id = id
  section.scrollIntoView = vi.fn()
  if (heading) {
    const h2 = document.createElement('h2')
    h2.tabIndex = -1
    h2.textContent = id
    section.appendChild(h2)
  }
  document.body.appendChild(section)
  return section
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
  window.history.replaceState(null, '', '/')
})

describe('prefersReducedMotion', () => {
  it('is false when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(prefersReducedMotion()).toBe(false)
  })

  it('is true when the reduce query matches', () => {
    stubReducedMotion(true)
    expect(prefersReducedMotion()).toBe(true)
  })

  it('is false when the reduce query does not match', () => {
    stubReducedMotion(false)
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('scrollToSection', () => {
  it('scrolls smoothly when motion is not reduced and returns the section', () => {
    const section = addSection('about')
    expect(scrollToSection('#about')).toBe(section)
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('jumps without animation under prefers-reduced-motion: reduce', () => {
    stubReducedMotion(true)
    const section = addSection('about')
    scrollToSection('#about')
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })
  })

  it('returns null when the section is missing', () => {
    expect(scrollToSection('#nowhere')).toBeNull()
  })
})

describe('focusSectionHeading', () => {
  it('focuses the section h2 without scrolling', () => {
    const section = addSection('about')
    const h2 = section.querySelector('h2')
    const focus = vi.spyOn(h2, 'focus')

    expect(focusSectionHeading('#about')).toBe(true)
    expect(h2).toHaveFocus()
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })

  it('falls back to a focusable section when it has no h2', () => {
    const section = addSection('contact', { heading: false })
    section.tabIndex = -1

    expect(focusSectionHeading('#contact')).toBe(true)
    expect(section).toHaveFocus()
  })

  it('returns false when there is nothing to focus', () => {
    addSection('contact', { heading: false })
    expect(focusSectionHeading('#contact')).toBe(false)
    expect(focusSectionHeading('#nowhere')).toBe(false)
  })
})

describe('setHash', () => {
  it('pushes the hash once and does not push it again when unchanged', () => {
    const push = vi.spyOn(window.history, 'pushState')

    setHash('#about')
    setHash('#about')

    expect(window.location.hash).toBe('#about')
    expect(push).toHaveBeenCalledTimes(1)
    push.mockRestore()
  })
})

describe('navigateToSection', () => {
  it('scrolls, sets the hash, and focuses the heading', () => {
    const section = addSection('gallery')

    navigateToSection('#gallery')

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(window.location.hash).toBe('#gallery')
    expect(section.querySelector('h2')).toHaveFocus()
  })
})

describe('isPlainLeftClick', () => {
  const base = { button: 0, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false }

  it('is true for an unmodified primary click', () => {
    expect(isPlainLeftClick(base)).toBe(true)
  })

  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'])('is false with %s held', (key) => {
    expect(isPlainLeftClick({ ...base, [key]: true })).toBe(false)
  })

  it('is false for a middle click', () => {
    expect(isPlainLeftClick({ ...base, button: 1 })).toBe(false)
  })
})
