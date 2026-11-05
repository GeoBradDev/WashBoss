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

  it('gives the copyright token at least 4.5:1 on the footer background', () => {
    expect(getContrastRatio(theme.palette.text.secondary, FOOTER_BG)).toBeGreaterThanOrEqual(4.5)
  })
})
