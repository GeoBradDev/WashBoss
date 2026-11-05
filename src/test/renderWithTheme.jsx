import { render } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme'

export function renderWithTheme(ui, options) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options)
}
