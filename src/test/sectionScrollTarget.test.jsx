import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTheme } from './renderWithTheme'
import { scrollToSection } from '../navigation'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'

// Issue #5 review finding F1: in-page nav scrolls the section's h2 (so a
// heading below other content, like About on a phone, lands on screen) and
// falls back to the section when it has no h2. Modified and middle clicks
// scroll nothing.

let added = []

function addSection(id, { heading = true } = {}) {
  const section = document.createElement('section')
  section.id = id
  section.scrollIntoView = vi.fn()
  let h2 = null
  if (heading) {
    h2 = document.createElement('h2')
    h2.tabIndex = -1
    h2.scrollIntoView = vi.fn()
    h2.textContent = `${id} heading`
    section.appendChild(h2)
  }
  document.body.appendChild(section)
  added.push(section)
  return { section, h2 }
}

afterEach(() => {
  for (const s of added) s.remove()
  added = []
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('section scroll target', () => {
  it('scrolls the section itself when it has no h2', () => {
    const { section } = addSection('contact', { heading: false })

    expect(scrollToSection('#contact')).toBe(section)
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('scrolls only the h2, not the section, when the section has one', () => {
    const { section, h2 } = addSection('about')

    scrollToSection('#about')

    expect(h2.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(section.scrollIntoView).not.toHaveBeenCalled()
  })
})

const MODIFIED_CLICKS = [
  ['Ctrl', { ctrlKey: true }],
  ['Meta', { metaKey: true }],
  ['Shift', { shiftKey: true }],
  ['Alt', { altKey: true }],
  ['middle button', { button: 1 }],
]

describe('modified and middle clicks scroll nothing', () => {
  it.each(MODIFIED_CLICKS)('desktop nav link: %s click leaves the h2 unscrolled', (_name, init) => {
    const { section, h2 } = addSection('services')
    renderWithTheme(<Navbar />)

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Services' }), init)

    expect(notPrevented).toBe(true)
    expect(h2.scrollIntoView).not.toHaveBeenCalled()
    expect(section.scrollIntoView).not.toHaveBeenCalled()
  })

  it.each(MODIFIED_CLICKS)('hero Get Free Estimate: %s click leaves the h2 unscrolled', (_name, init) => {
    const { section, h2 } = addSection('contact')
    renderWithTheme(<Hero />)

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Get Free Estimate' }), init)

    expect(notPrevented).toBe(true)
    expect(h2.scrollIntoView).not.toHaveBeenCalled()
    expect(section.scrollIntoView).not.toHaveBeenCalled()
  })
})
