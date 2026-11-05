import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, IconButton, List, ListItem, ListItemButton, ListItemText } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { renderWithTheme } from './renderWithTheme'
import theme from '../theme'

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

// Keyboard focus on MUI buttons must show the same 3px primary.main outline
// the gallery thumbnails and logo use (WCAG 2.4.7 and 1.4.11).
describe('theme focus ring', () => {
  it('outlines a keyboard-focused IconButton with a dark inner band', async () => {
    const user = userEvent.setup()
    renderWithTheme(<IconButton aria-label="Open menu"><MenuIcon /></IconButton>)

    await user.tab()
    const button = screen.getByRole('button', { name: 'Open menu' })
    expect(button).toHaveFocus()
    expect(button).toHaveClass('Mui-focusVisible')

    const style = getComputedStyle(button)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('3px')
    expect(style.outlineColor).toBe(hexToRgb(theme.palette.primary.main))
    expect(style.outlineOffset).toBe('2px')
    expect(style.boxShadow).toContain(hexToRgb(theme.palette.background.default))
  })

  it('outlines a keyboard-focused contained Button', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Button variant="contained" color="primary">Get a Free Quote</Button>)

    await user.tab()
    const button = screen.getByRole('button', { name: 'Get a Free Quote' })
    expect(button).toHaveClass('Mui-focusVisible')

    const style = getComputedStyle(button)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('3px')
    expect(style.outlineColor).toBe(hexToRgb(theme.palette.primary.main))
    expect(style.outlineOffset).toBe('2px')
  })

  it('does not pulse a focus ripple over a focused Button label', async () => {
    // The ripple is currentColor at 0.3 opacity: near-black over the orange it
    // drops the label to about 3.8:1 (3.1:1 while hovered). The outline replaces it.
    const user = userEvent.setup()
    renderWithTheme(<Button variant="contained" color="primary">Get a Free Quote</Button>)

    await user.tab()
    const button = screen.getByRole('button', { name: 'Get a Free Quote' })
    expect(button).toHaveClass('Mui-focusVisible')
    expect(button.querySelector('.MuiTouchRipple-ripplePulsate')).toBeNull()
  })

  it('outlines a keyboard-focused drawer ListItemButton, inset so the drawer paper does not clip it', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <List>
        <ListItem disablePadding>
          <ListItemButton><ListItemText primary="About" /></ListItemButton>
        </ListItem>
      </List>,
    )

    await user.tab()
    const item = screen.getByRole('button', { name: 'About' })
    expect(item).toHaveFocus()
    expect(item).toHaveClass('Mui-focusVisible')

    const style = getComputedStyle(item)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineWidth).toBe('3px')
    expect(style.outlineColor).toBe(hexToRgb(theme.palette.primary.main))
    expect(style.outlineOffset).toBe('-3px')
  })

  it('shows no outline on an IconButton without focus', () => {
    renderWithTheme(<IconButton aria-label="Open menu"><MenuIcon /></IconButton>)

    const style = getComputedStyle(screen.getByRole('button', { name: 'Open menu' }))
    expect(style.outlineStyle).not.toBe('solid')
  })
})
