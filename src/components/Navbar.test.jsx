import { describe, it, expect, vi } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/renderWithTheme'
import theme from '../theme'
import Navbar from './Navbar'

const NAV_ITEMS = ['Services', 'About', 'Gallery', 'Contact']

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

async function openDrawer(user) {
  const hamburger = screen.getByTestId('MenuIcon').closest('button')
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
    renderWithTheme(<Navbar />)

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
      renderWithTheme(<Navbar />)
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
    renderWithTheme(<Navbar />)

    const paper = await openDrawer(user)
    const style = window.getComputedStyle(paper)

    expect(style.width).toBe('240px')
    expect(style.backgroundColor).toBe(hexToRgb(theme.palette.background.default))
    expect(document.querySelectorAll('[paperprops]')).toHaveLength(0)
  })
})
