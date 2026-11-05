import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from './renderWithTheme'
import { axeViolations } from './axe'
import App from '../App'

// Full-page structure for issue #5: one banner, one Primary navigation, one
// main, one contentinfo, and a heading outline with no skipped levels.
describe('page landmarks and headings', () => {
  it('has exactly one banner, Primary navigation, main, and contentinfo', () => {
    renderWithTheme(<App />)

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })

  it('puts the hero and every section inside main, and the footer outside it', () => {
    renderWithTheme(<App />)

    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main')
    expect(main).toHaveAttribute('tabindex', '-1')
    for (const id of ['hero', 'services', 'about', 'gallery', 'contact']) {
      expect(main.contains(document.getElementById(id))).toBe(true)
    }
    expect(main.contains(screen.getByRole('contentinfo'))).toBe(false)
  })

  it('names each nav target section after its h2', () => {
    renderWithTheme(<App />)

    const expected = {
      services: 'Our Services',
      about: 'About Wash Boss',
      gallery: 'Our Work',
      contact: 'Get in Touch',
    }
    for (const [id, name] of Object.entries(expected)) {
      const section = document.getElementById(id)
      expect(section.tagName).toBe('SECTION')
      expect(screen.getByRole('region', { name })).toBe(section)
      const heading = within(section).getByRole('heading', { level: 2, name })
      expect(heading).toHaveAttribute('tabindex', '-1')
    }
  })

  it('has one h1 and an outline with no skipped levels', () => {
    const { container } = renderWithTheme(<App />)

    const outline = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
      (h) => `${h.tagName.toLowerCase()} ${h.textContent.trim()}`,
    )
    expect(outline).toEqual([
      'h1 St. Louis\'s PremierPressure Washing Experts',
      'h2 Our Services',
      'h3 Pressure Washing',
      'h3 Soft Washing',
      'h3 Concrete Sealing',
      'h3 Paver Sealing',
      'h2 About Wash Boss',
      'h2 Our Work',
      'h2 Get in Touch',
      'h3 Call or Text',
      'h3 Service Area',
    ])
  })

  it('makes "Skip to content" the first focusable element and points it at main', async () => {
    const user = userEvent.setup()
    renderWithTheme(<App />)

    await user.tab()

    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', '#main')
  })

  it('has no axe violations on the full page, with region and heading-order on', async () => {
    renderWithTheme(<App />)

    // Run on the document: axe skips page-level rules such as region when the
    // context is a single container element. The title and lang live in
    // index.html, which this render does not load, so those two rules are off.
    const rules = { 'document-title': { enabled: false }, 'html-has-lang': { enabled: false } }
    expect(await axeViolations(document, rules)).toEqual([])
  })
})
