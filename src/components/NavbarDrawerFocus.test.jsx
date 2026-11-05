import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { renderWithTheme } from '../test/renderWithTheme'
import theme from '../theme'
import Navbar from './Navbar'

// jsdom evaluates media queries at a fixed 1024px width, where the md:none
// rule hides the hamburger. Raising the breakpoint values renders the phone
// layout at that width, with the real theme otherwise unchanged.
const phoneTheme = {
  ...theme,
  breakpoints: createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 1200, lg: 1400, xl: 1600 } },
  }).breakpoints,
}

// Chrome logs "Blocked aria-hidden on an element because its descendant
// retained focus" when focus returns to the menu button while the drawer's
// Modal still has aria-hidden on the rest of the page. Record, at the moment
// the button receives focus, whether any ancestor is aria-hidden.
async function closeAndRecordHiddenAncestor(user, closeDrawer) {
  renderWithTheme(
    <ThemeProvider theme={phoneTheme}>
      <Navbar />
    </ThemeProvider>,
  )
  const hamburger = screen.getByRole('button', { name: 'Open navigation menu' })
  const hiddenAncestorsAtFocus = []
  hamburger.addEventListener('focus', () => {
    const hidden = hamburger.closest('[aria-hidden="true"]')
    hiddenAncestorsAtFocus.push(hidden ? hidden.tagName : null)
  })

  await user.click(hamburger)
  await waitFor(() => {
    expect(document.querySelector('.MuiDrawer-paper')).not.toBeNull()
  })

  await closeDrawer()

  await waitFor(() => {
    expect(document.querySelector('.MuiDrawer-paper')).toBeNull()
  })
  return { hamburger, hiddenAncestorsAtFocus }
}

describe('Navbar drawer focus return', () => {
  it('returns focus to the menu button only after the page is no longer aria-hidden (Escape)', async () => {
    const user = userEvent.setup()
    const { hamburger, hiddenAncestorsAtFocus } = await closeAndRecordHiddenAncestor(user, () =>
      user.keyboard('{Escape}'),
    )

    expect(hamburger).toHaveFocus()
    expect(hiddenAncestorsAtFocus.at(-1)).toBeNull()
  })

  it('returns focus to the menu button only after the page is no longer aria-hidden (nav item)', async () => {
    const user = userEvent.setup()
    const { hamburger, hiddenAncestorsAtFocus } = await closeAndRecordHiddenAncestor(user, () =>
      user.click(screen.getByRole('button', { name: 'About' })),
    )

    expect(hamburger).toHaveFocus()
    expect(hiddenAncestorsAtFocus.at(-1)).toBeNull()
  })
})
