import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/renderWithTheme'
import { axeViolations } from '../test/axe'
import Lightbox from './Lightbox'

const PHOTOS = [
  { src: '/photo-01.webp', thumb: '/photo-01-thumb.webp', alt: 'First photo' },
  { src: '/photo-02.webp', thumb: '/photo-02-thumb.webp', alt: 'Second photo' },
]

function renderLightbox(index = 0) {
  const handlers = { onClose: vi.fn(), onPrev: vi.fn(), onNext: vi.fn() }
  renderWithTheme(<Lightbox photos={PHOTOS} index={index} {...handlers} />)
  return handlers
}

describe('Lightbox', () => {
  it('calls onClose exactly once when Escape is pressed', async () => {
    const user = userEvent.setup()
    const { onClose } = renderLightbox()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('is a modal dialog named Photo viewer', () => {
    renderLightbox()

    const dialog = screen.getByRole('dialog', { name: 'Photo viewer' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('moves focus to the Close button on open', () => {
    renderLightbox()

    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
  })

  it('calls onPrev on ArrowLeft and onNext on ArrowRight', async () => {
    const user = userEvent.setup()
    const { onPrev, onNext } = renderLightbox()

    await user.keyboard('{ArrowLeft}')
    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onNext).not.toHaveBeenCalled()

    await user.keyboard('{ArrowRight}')
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrev).toHaveBeenCalledTimes(1)
  })

  it('shows the full-size image with the photo alt', () => {
    renderLightbox(1)

    expect(screen.getByRole('img', { name: 'Second photo' })).toHaveAttribute('src', '/photo-02.webp')
  })

  it('has no axe violations while open', async () => {
    renderLightbox()

    // region fires on an isolated render with no landmarks; landmarks are issue #5.
    expect(await axeViolations(document.body, { region: { enabled: false } })).toEqual([])
  })

  it('ignores arrow keys with Alt, Control, or Meta held so browser shortcuts still work', () => {
    const { onPrev, onNext } = renderLightbox()
    const dialog = screen.getByRole('dialog', { name: 'Photo viewer' })

    for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
      for (const key of ['ArrowLeft', 'ArrowRight']) {
        const notPrevented = fireEvent.keyDown(dialog, { key, [modifier]: true })
        expect(notPrevented, `${modifier} ${key} default`).toBe(true)
      }
    }
    expect(onPrev).not.toHaveBeenCalled()
    expect(onNext).not.toHaveBeenCalled()
  })
})
