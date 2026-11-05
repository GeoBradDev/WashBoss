import { describe, it, expect, vi } from 'vitest'
import { screen, within, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { renderWithTheme } from '../test/renderWithTheme'
import { axeViolations } from '../test/axe'
import theme from '../theme'
import Navbar from './Navbar'

const NAV_ITEMS = ['Services', 'About', 'Gallery', 'Contact']

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

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
  const hamburger = getHamburger()
  await user.click(hamburger)
  const paper = await waitFor(() => {
    const el = document.querySelector('.MuiDrawer-paper')
    expect(el).not.toBeNull()
    return el
  })
  return paper
}

describe('Navbar mobile drawer', () => {
  it('opens from the hamburger and shows all nav items and the quote button', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    const paper = await openDrawer(user)
    const drawer = within(paper)

    for (const label of NAV_ITEMS) {
      expect(drawer.getByText(label)).toBeInTheDocument()
    }
    expect(drawer.getByRole('button', { name: 'Get a Free Quote' })).toBeInTheDocument()
  })

  it('scrolls to the matching section and closes when an item is clicked', async () => {
    const user = userEvent.setup()
    const section = document.createElement('section')
    section.id = 'about'
    section.scrollIntoView = vi.fn()
    document.body.appendChild(section)

    try {
      renderPhoneNavbar()
      const paper = await openDrawer(user)

      await user.click(within(paper).getByText('About'))

      expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
      await waitFor(() => {
        expect(document.querySelector('.MuiDrawer-paper')).toBeNull()
      })
    } finally {
      section.remove()
    }
  })

  it('styles the drawer paper through slotProps.paper', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    const paper = await openDrawer(user)
    const style = window.getComputedStyle(paper)

    expect(style.width).toBe('240px')
    expect(style.backgroundColor).toBe(hexToRgb(theme.palette.background.default))
    expect(document.querySelectorAll('[paperprops]')).toHaveLength(0)
  })
})

describe('Navbar accessibility', () => {
  it('names the hamburger and reports its expanded state', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    const hamburger = getHamburger()
    expect(hamburger).toHaveAttribute('aria-expanded', 'false')

    await openDrawer(user)

    expect(hamburger).toHaveAttribute('aria-expanded', 'true')
  })

  it('points aria-controls at the drawer paper', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    const hamburger = getHamburger()
    const paper = await openDrawer(user)

    expect(paper.id).not.toBe('')
    expect(hamburger).toHaveAttribute('aria-controls', paper.id)
  })

  it('moves focus into the drawer on open and back to the hamburger on Escape', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()

    const hamburger = getHamburger()
    const paper = await openDrawer(user)

    await waitFor(() => {
      expect(paper.contains(document.activeElement)).toBe(true)
    })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(document.querySelector('.MuiDrawer-paper')).toBeNull()
    })
    expect(hamburger).toHaveFocus()
  })

  it('makes the logo a link that scrolls to the top on Enter', async () => {
    const user = userEvent.setup()
    vi.mocked(window.scrollTo).mockClear()
    renderPhoneNavbar()

    const logo = screen.getByRole('link', { name: 'Wash Boss Pressure Washing, back to top' })
    await user.tab()
    expect(logo).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('has no axe violations with the drawer closed', async () => {
    const { container } = renderPhoneNavbar()

    // region fires on an isolated render with no landmarks; landmarks are issue #5.
    expect(await axeViolations(container, { region: { enabled: false } })).toEqual([])
  })

  it('has no axe violations with the drawer open', async () => {
    const user = userEvent.setup()
    renderPhoneNavbar()
    await openDrawer(user)

    // region fires on an isolated render with no landmarks; landmarks are issue #5.
    expect(await axeViolations(document.body, { region: { enabled: false } })).toEqual([])
  })

  it('scrolls to the top on a logo click without following the link or changing the hash', () => {
    vi.mocked(window.scrollTo).mockClear()
    const hashBefore = window.location.hash
    renderPhoneNavbar()

    const logo = screen.getByRole('link', { name: 'Wash Boss Pressure Washing, back to top' })
    const notPrevented = fireEvent.click(logo)

    expect(notPrevented).toBe(false)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(window.location.hash).toBe(hashBefore)
  })
})
