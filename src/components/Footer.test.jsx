import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { getContrastRatio } from '@mui/material/styles'
import { renderWithTheme } from '../test/renderWithTheme'
import theme from '../theme'
import Footer from './Footer'

const FOOTER_BG = '#080808'

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

describe('Footer', () => {
  it('renders the copyright in the text.secondary token', () => {
    renderWithTheme(<Footer />)

    const copyright = screen.getByText(/All rights reserved/)
    expect(getComputedStyle(copyright).color).toBe(hexToRgb(theme.palette.text.secondary))
  })

  it('gives the copyright at least 4.5:1 on the rendered footer background', () => {
    renderWithTheme(<Footer />)

    // Read both colors from the render so a later background change is caught.
    let el = screen.getByText(/All rights reserved/)
    const text = getComputedStyle(el).color
    let bg = getComputedStyle(el).backgroundColor
    while (el && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' || bg === '')) {
      el = el.parentElement
      bg = el ? getComputedStyle(el).backgroundColor : ''
    }
    expect(bg).toBe(hexToRgb(FOOTER_BG))
    expect(getContrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5)
  })
})
