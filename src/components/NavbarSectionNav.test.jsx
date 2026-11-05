import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { renderWithTheme } from '../test/renderWithTheme'
import theme from '../theme'
import Navbar from './Navbar'

// In-page navigation for issue #5: desktop items are links in a nav named
// Primary, and every nav path moves focus to the target section's h2.

const SECTIONS = ['services', 'about', 'gallery', 'contact']

// jsdom evaluates media queries at a fixed 1024px width, where the md:none
// rule hides the hamburger. Raising the breakpoint values renders the phone
// layout at that width, with the real theme otherwise unchanged.
const phoneTheme = {
  ...theme,
  breakpoints: createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 1200, lg: 1400, xl: 1600 } },
  }).breakpoints,
}

// Adds the sections the nav points at, each with a focusable h2, the way
// the real page renders them.
function addSections() {
  const added = SECTIONS.map((id) => {
    const section = document.createElement('section')
    section.id = id
    section.scrollIntoView = vi.fn()
    const h2 = document.createElement('h2')
    h2.tabIndex = -1
    h2.textContent = `${id} heading`
    section.appendChild(h2)
    document.body.appendChild(section)
    return section
  })
  return Object.fromEntries(added.map((s) => [s.id, s]))
}

function headingOf(section) {
  return section.querySelector('h2')
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

let sections = {}

afterEach(() => {
  for (const s of Object.values(sections)) s.remove()
  sections = {}
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('Navbar desktop nav', () => {
  it('renders the desktop items as links inside a navigation named Primary', () => {
    renderWithTheme(<Navbar />)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Services', '#services'],
      ['About', '#about'],
      ['Gallery', '#gallery'],
      ['Contact', '#contact'],
      ['Get a Free Quote', '#contact'],
    ])
  })

  it('keeps the logo link outside the Primary navigation', () => {
    renderWithTheme(<Navbar />)

    const nav = screen.getByRole('navigation', { name: 'Primary' })
    const logo = screen.getByRole('link', { name: 'Wash Boss Pressure Washing, back to top' })
    expect(nav.contains(logo)).toBe(false)
  })

  it('scrolls to the section, focuses its h2, and sets the hash on a click', () => {
    sections = addSections()
    renderWithTheme(<Navbar />)

    const link = within(screen.getByRole('navigation', { name: 'Primary' }))
      .getByRole('link', { name: 'About' })
    const notPrevented = fireEvent.click(link)

    expect(notPrevented).toBe(false)
    expect(sections.about.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(headingOf(sections.about)).toHaveFocus()
    expect(window.location.hash).toBe('#about')
  })

  it('sends Get a Free Quote to the Contact h2', () => {
    sections = addSections()
    renderWithTheme(<Navbar />)

    fireEvent.click(screen.getByRole('link', { name: 'Get a Free Quote' }))

    expect(headingOf(sections.contact)).toHaveFocus()
    expect(window.location.hash).toBe('#contact')
  })

  it('moves focus to the h2 when a link is activated with Enter', async () => {
    const user = userEvent.setup()
    sections = addSections()
    renderWithTheme(<Navbar />)

    const link = screen.getByRole('link', { name: 'Gallery' })
    link.focus()
    await user.keyboard('{Enter}')

    expect(headingOf(sections.gallery)).toHaveFocus()
    expect(window.location.hash).toBe('#gallery')
  })

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Meta', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['middle button', { button: 1 }],
  ])('leaves a %s click to the browser', (_name, init) => {
    sections = addSections()
    renderWithTheme(<Navbar />)

    const link = screen.getByRole('link', { name: 'Services' })
    const notPrevented = fireEvent.click(link, init)

    expect(notPrevented).toBe(true)
    expect(sections.services.scrollIntoView).not.toHaveBeenCalled()
    expect(headingOf(sections.services)).not.toHaveFocus()
  })
})

describe('Navbar drawer section focus', () => {
  it('focuses the chosen section h2 once the drawer has closed and the page is not aria-hidden', async () => {
    const user = userEvent.setup()
    sections = addSections()
    renderPhoneNavbar()
    const h2 = headingOf(sections.about)
    const hiddenAtFocus = []
    h2.addEventListener('focus', () => {
      hiddenAtFocus.push(Boolean(h2.closest('[aria-hidden="true"]')))
    })

    const paper = await openDrawer(user)
    await user.click(within(paper).getByRole('button', { name: 'About' }))

    expect(sections.about.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(window.location.hash).toBe('#about')
    await waitForDrawerClosed()
    await waitFor(() => expect(h2).toHaveFocus())
    expect(hiddenAtFocus).toEqual([false])
  })

  it('sends the drawer Get a Free Quote to the Contact h2', async () => {
    const user = userEvent.setup()
    sections = addSections()
    renderPhoneNavbar()

    const paper = await openDrawer(user)
    await user.click(within(paper).getByRole('button', { name: 'Get a Free Quote' }))

    await waitForDrawerClosed()
    await waitFor(() => expect(headingOf(sections.contact)).toHaveFocus())
    expect(window.location.hash).toBe('#contact')
  })

  it('returns Escape to the hamburger after an earlier item choice', async () => {
    const user = userEvent.setup()
    sections = addSections()
    renderPhoneNavbar()

    const paper = await openDrawer(user)
    await user.click(within(paper).getByRole('button', { name: 'About' }))
    await waitForDrawerClosed()
    await waitFor(() => expect(headingOf(sections.about)).toHaveFocus())

    await openDrawer(user)
    await user.keyboard('{Escape}')
    await waitForDrawerClosed()

    await waitFor(() => expect(getHamburger()).toHaveFocus())
  })

  it('returns the backdrop close to the hamburger with sections present', async () => {
    const user = userEvent.setup()
    sections = addSections()
    renderPhoneNavbar()

    await openDrawer(user)
    await user.click(document.querySelector('.MuiBackdrop-root'))
    await waitForDrawerClosed()

    await waitFor(() => expect(getHamburger()).toHaveFocus())
  })
})

describe('Navbar drawer at the md breakpoint', () => {
  it('closes the open drawer and focuses the first desktop link when the viewport widens to md', async () => {
    const media = stubMatchMedia()
    const user = userEvent.setup()
    renderPhoneNavbar()

    await openDrawer(user)
    media.setWide(true)
    await waitForDrawerClosed()

    // jsdom still applies the phone breakpoints to CSS, so the desktop nav is
    // display:none here; the query includes hidden elements for that reason.
    const nav = screen.getByRole('navigation', { name: 'Primary', hidden: true })
    const services = within(nav).getByRole('link', { name: 'Services', hidden: true })
    await waitFor(() => expect(services).toHaveFocus())
  })
})
