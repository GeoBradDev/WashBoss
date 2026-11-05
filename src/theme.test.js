import { describe, it, expect } from 'vitest'
import { getContrastRatio } from '@mui/material/styles'
import theme from './theme'

const { primary, background } = theme.palette

// WCAG 2.2 AA: 1.4.3 needs 4.5:1 for button text (16 to 17.6px bold is below the
// large-text threshold), and 1.4.11 needs 3:1 for a focus outline.
describe('theme contrast', () => {
  it('keeps the brand orange as primary.main', () => {
    expect(primary.main).toBe('#FF6B00')
  })

  it('gives contained primary buttons at least 4.5:1 text contrast at rest', () => {
    expect(getContrastRatio(primary.contrastText, primary.main)).toBeGreaterThanOrEqual(4.5)
  })

  it('gives contained primary buttons at least 4.5:1 text contrast on hover (primary.dark)', () => {
    expect(getContrastRatio(primary.contrastText, primary.dark)).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps the primary.main focus outline at least 3:1 on the page background', () => {
    expect(getContrastRatio(primary.main, background.default)).toBeGreaterThanOrEqual(3)
  })
})
