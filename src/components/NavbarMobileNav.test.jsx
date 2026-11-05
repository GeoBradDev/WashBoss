import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { renderWithTheme } from '../test/renderWithTheme'
import { axeViolations } from '../test/axe'
import theme from '../theme'
import Navbar from './Navbar'

// Phase 5 review findings for issue #5: the phone layout's navigation
// landmark (F2), an item choice winning over the md fallback (F4), and the
// md fallback link being visible (F5).

// jsdom evaluates media queries at a fixed 1024px width, where the md:none
// rule hides the hamburger. Raising the breakpoint values renders the phone
// layout at that width, with the real theme otherwise unchanged.
const phoneTheme = {
  ...theme,
  breakpoints: createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 1200, lg: 1400, xl: 1600 } },
  }).breakpoints,
}

function renderPhoneNavbar() {
  return renderWithTheme(
    <ThemeProvider theme={phoneTheme}>
      <Navbar />
    </ThemeProvider>,
  )
}

function getHamburger() {
  return screen.getByRole('button', { name: 'Open navigation menu' })
}

async function openDrawer(user) {
  await user.click(getHamburger())
  return waitFor(() => {
    const el = document.querySelector('.MuiDrawer-paper')
    expect(el).not.toBeNull()
    return el
  })
}

async function waitForDrawerClosed() {
  await waitFor(() => {
    expect(document.querySelector('.MuiDrawer-paper')).toBeNull()
  })
}

// A controllable matchMedia: width queries follow `state.wide`, everything
// else (prefers-reduced-motion) does not match.
function stubMatchMedia() {
  const state = { wide: false }
  const listeners = new Set()
  vi.stubGlobal('matchMedia', (query) => ({
    get matches() {
      return query.includes('min-width') ? state.wide : false
    },
    media: query,
    addEventListener: (_type, fn) => listeners.add(fn),
    removeEventListener: (_type, fn) => listeners.delete(fn),
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
  }))
  return {
    setWide(wide) {
      state.wide = wide
      act(() => {
        for (const fn of [...listeners]) fn({ matches: wide })
      })
    },
  }
}

function addSection(id) {
  const section = document.createElement('section')
  section.id = id
  section.scrollIntoView = vi.fn()
  const h2 = document.createElement('h2')
  h2.tabIndex = -1
  h2.textContent = `${id} heading`
  section.appendChild(h2)
  document.body.appendChild(section)
  return section
}

let section = null

afterEach(() => {
  section?.remove()
  section = null
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('Navbar phone layout navigation landmark (F2)', () => {
  it('exposes a navigation named Primary that contains the hamburger', () => {
    renderPhoneNavbar()

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    expect(nav).toContainElement(getHamburger())
  })

  it('keeps the logo link outside the Primary navigation', () => {
    renderPhoneNavbar()

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const logo = screen.getByRole('link', { name: 'Wash Boss Pressure Washing, back to top' })
    expect(nav).not.toContainElement(logo)
  })

  it('puts the open drawer items inside a navigation landmark', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    const paper = await openDrawer(user)
    const nav = within(paper).getByRole('navigation')
    expect(within(nav).getByRole('button', { name: 'About' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'Get a Free Quote' })).toBeInTheDocument()
  })

  it('has no axe violations on the body with the drawer closed and open', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    expect(await axeViolations(document.body)).toEqual([])

    await openDrawer(user)
    expect(await axeViolations(document.body)).toEqual([])
  })
})

describe('Navbar drawer at the md breakpoint, item choice (F4)', () => {
  it('focuses the chosen section h2 when the viewport widens to md while the drawer is closing', async () => {
    const media = stubMatchMedia()
    const user = userEvent.setup()
    section = addSection('about')
    renderPhoneNavbar()

    const paper = await openDrawer(user)
    await user.click(within(paper).getByRole('button', { name: 'About' }))
    media.setWide(true)
    await waitForDrawerClosed()

    await waitFor(() => expect(section.querySelector('h2')).toHaveFocus())
  })
})

describe('Navbar drawer at the md breakpoint, visible fallback (F5)', () => {
  it('focuses a desktop link with no display:none ancestor after widening to md', async () => {
    const media = stubMatchMedia()
    const user = userEvent.setup()
    renderPhoneNavbar()

    await openDrawer(user)
    media.setWide(true)
    await waitForDrawerClosed()

    await waitFor(() => expect(document.activeElement.tagName).toBe('A'))
    const focused = document.activeElement
    expect(focused).toHaveTextContent('Services')
    const hiddenAncestors = []
    for (let el = focused; el; el = el.parentElement) {
      if (getComputedStyle(el).display === 'none') hiddenAncestors.push(el.tagName)
    }
    expect(hiddenAncestors).toEqual([])
  })
})
