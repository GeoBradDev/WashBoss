import { createTheme } from '@mui/material/styles'

// Keyboard focus ring shared with the gallery thumbnails and logo: 3px
// primary.main, at least 6.4:1 on every page background.
const focusOutline = (theme) => ({
  outline: `3px solid ${theme.palette.primary.main}`,
  outlineOffset: 2,
})

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B00',
      // Contained buttons hover to primary.dark. MUI's computed dark (#B24A00)
      // gives only 3.65:1 with the near-black text, so it is set explicitly.
      dark: '#E05E00',
      // Near-black text on the brand orange is 6.93:1 (white was 2.86:1).
      contrastText: '#0a0a0a',
    },
    secondary: {
      main: '#1E9FD4',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#141414',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      // The focus ripple is currentColor at 0.3 opacity, which darkens the orange
      // behind the near-black label below 4.5:1. The outline replaces it.
      defaultProps: { disableFocusRipple: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
          '&.Mui-focusVisible': focusOutline(theme),
        }),
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focusVisible': {
            ...focusOutline(theme),
            // Fills the offset gap with near-black so the orange ring keeps its
            // contrast where the lightbox controls sit over a bright photo.
            boxShadow: `0 0 0 2px ${theme.palette.background.default}`,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#141414',
          border: '1px solid #222222',
        },
      },
    },
  },
})

export default theme