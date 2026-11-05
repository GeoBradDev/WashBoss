import { Box } from '@mui/material'

// First focusable element on the page. Visually hidden until it takes
// keyboard focus, then shown above the fixed AppBar. The native fragment jump
// moves focus to <main id="main" tabIndex={-1}>.
export default function SkipLink() {
  return (
    <Box
      component="a"
      href="#main"
      sx={(theme) => ({
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: theme.zIndex.appBar + 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        backgroundColor: 'background.default',
        color: 'text.primary',
        fontWeight: 700,
        textDecoration: 'none',
        '&:not(:focus)': {
          clip: 'rect(0 0 0 0)',
          clipPath: 'inset(50%)',
          height: '1px',
          width: '1px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          padding: 0,
        },
        '&:focus': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
      })}
    >
      Skip to content
    </Box>
  )
}
