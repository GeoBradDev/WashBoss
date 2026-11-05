import { describe, it, expect } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/renderWithTheme'
import { axeViolations } from '../test/axe'
import Gallery from './Gallery'

const ALTS = [
  'Two-story white house with a dark two-level deck and staircase',
  'Collage of five homes with clean siding, decks, and a brick chimney',
  'Stone retaining wall and patio beside wooden stairs, before and after cleaning',
  'Cream siding with dark mildew streaks above a patio, before and after washing',
  'Front concrete walkway beside a rock bed, before and after cleaning',
  'Brick home with a composite deck, stairs, and chimney',
  'Stained concrete driveway, before and after cleaning',
  'Yellow siding gable with mildew under string lights, before and after washing',
  'Wash Boss pickup truck and branded trailer parked on a residential street',
  'Pool diving board and deck, before and after cleaning',
  'Two-story gray home with a stone lower level and patio',
  'Yellow siding with green algae around a window, before and after washing',
  'Restaurant drive-through lane, wet after a night wash',
  'Sidewalk being cleaned with a surface cleaner, and the finished result',
  'Concrete walkway along a brick wall, before and after cleaning',
  'Back of a white-sided townhouse with string lights and steps, two views',
  'Concrete patio below a deck, before and after cleaning',
  'Front walkway with a landscape light, before and after cleaning',
  'Cream gable siding, clean on top and stained on the bottom',
  'White soffit, clean on top and covered in black mildew on the bottom',
  'Tan gable siding, clean on the left and streaked on the right',
  'Wet drive-through pavement with yellow striping outside a restaurant',
]

const thumbName = (i) => `Open photo ${i + 1} of 22: ${ALTS[i]}`

describe('Gallery', () => {
  it('renders 22 thumbnail buttons, each named with its number and its own alt', () => {
    renderWithTheme(<Gallery />)

    const thumbs = screen.getAllByRole('button', { name: /^Open photo \d+ of 22: / })
    expect(thumbs).toHaveLength(22)
    thumbs.forEach((thumb, i) => {
      expect(thumb).toHaveAccessibleName(thumbName(i))
    })
    expect(new Set(thumbs.map((t) => t.getAttribute('aria-label'))).size).toBe(22)
    expect(thumbs[0].querySelector('img')).toHaveAttribute('src', expect.stringContaining('photo-01-thumb.webp'))
  })

  it('opens the lightbox on the clicked photo with a counter and closes it', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    await user.click(screen.getByRole('button', { name: thumbName(4) }))

    expect(await screen.findByText('5 / 22')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: ALTS[4] })).toHaveAttribute(
      'src',
      expect.stringContaining('photo-05.webp'),
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByText('5 / 22')).not.toBeInTheDocument()
    })
    expect(document.querySelector('img[src$="photo-05.webp"]')).toBeNull()
  })

  it('reaches the first thumbnail with Tab and opens it with Enter', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    await user.tab()
    expect(screen.getByRole('button', { name: thumbName(0) })).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(await screen.findByText('1 / 22')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: ALTS[0] })).toHaveAttribute(
      'src',
      expect.stringContaining('photo-01.webp'),
    )
  })

  it('opens a focused thumbnail with Space', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    await user.tab()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: thumbName(2) })).toHaveFocus()

    await user.keyboard(' ')

    expect(await screen.findByText('3 / 22')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: ALTS[2] })).toBeInTheDocument()
  })

  it('cycles Tab among Previous, Next, and Close inside the lightbox', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    await user.click(screen.getByRole('button', { name: thumbName(0) }))
    await screen.findByText('1 / 22')

    const close = screen.getByRole('button', { name: 'Close' })
    const prev = screen.getByRole('button', { name: 'Previous photo' })
    const next = screen.getByRole('button', { name: 'Next photo' })
    expect(close).toHaveFocus()

    await user.tab()
    expect(prev).toHaveFocus()
    await user.tab()
    expect(next).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(next).toHaveFocus()
  })

  it('returns focus to the originating thumbnail when Escape closes the lightbox', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    const thumb = screen.getByRole('button', { name: thumbName(6) })
    thumb.focus()
    await user.keyboard('{Enter}')
    await screen.findByText('7 / 22')

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByText('7 / 22')).not.toBeInTheDocument()
    })
    expect(thumb).toHaveFocus()
  })

  it('wraps from photo 1 to 22 with ArrowLeft and back with ArrowRight', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    await user.click(screen.getByRole('button', { name: thumbName(0) }))
    await screen.findByText('1 / 22')

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByText('22 / 22')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: ALTS[21] })).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByText('1 / 22')).toBeInTheDocument()
  })

  it('has no axe violations when closed', async () => {
    const { container } = renderWithTheme(<Gallery />)

    // region fires on an isolated render with no landmarks; landmarks are issue #5.
    expect(await axeViolations(container, { region: { enabled: false } })).toEqual([])
  })

  it('keeps the lightbox open while Enter is held on a thumbnail', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    screen.getByRole('button', { name: thumbName(1) }).focus()
    await user.keyboard('{Enter>6/}')

    expect(screen.getByText('2 / 22')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  // Safari does not focus a button on click, so the lightbox cannot rely on
  // the previously focused element to find the thumbnail that opened it.
  // Each close path must still return focus there, after the page behind the
  // dialog is no longer aria-hidden.
  async function openWithoutFocusAndClose(close) {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)
    const thumb = screen.getByRole('button', { name: thumbName(8) })
    const hiddenAncestorsAtFocus = []
    thumb.addEventListener('focus', () => {
      const hidden = thumb.closest('[aria-hidden="true"]')
      hiddenAncestorsAtFocus.push(hidden ? hidden.tagName : null)
    })

    fireEvent.click(thumb)
    await screen.findByText('9 / 22')
    await close(user)

    await waitFor(() => {
      expect(screen.queryByText('9 / 22')).not.toBeInTheDocument()
    })
    return { thumb, hiddenAncestorsAtFocus }
  }

  it('returns focus to a thumbnail opened without focus when Escape closes the lightbox', async () => {
    const { thumb, hiddenAncestorsAtFocus } = await openWithoutFocusAndClose((user) =>
      user.keyboard('{Escape}'),
    )

    expect(thumb).toHaveFocus()
    expect(hiddenAncestorsAtFocus).toEqual([null])
  })

  it('returns focus to a thumbnail opened without focus when the Close button closes the lightbox', async () => {
    const { thumb, hiddenAncestorsAtFocus } = await openWithoutFocusAndClose((user) =>
      user.click(screen.getByRole('button', { name: 'Close' })),
    )

    expect(thumb).toHaveFocus()
    expect(hiddenAncestorsAtFocus).toEqual([null])
  })

  it('returns focus to a thumbnail opened without focus when the backdrop closes the lightbox', async () => {
    const { thumb, hiddenAncestorsAtFocus } = await openWithoutFocusAndClose((user) =>
      user.click(document.querySelector('.MuiBackdrop-root')),
    )

    expect(thumb).toHaveFocus()
    expect(hiddenAncestorsAtFocus).toEqual([null])
  })

  it('stays closed when Enter is held on the Close button', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    const thumb = screen.getByRole('button', { name: thumbName(3) })
    thumb.focus()
    await user.keyboard('{Enter}')
    await screen.findByText('4 / 22')
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()

    await user.keyboard('{Enter>6/}')

    expect(screen.queryByText('4 / 22')).not.toBeInTheDocument()
    expect(thumb).toHaveFocus()
  })
})
