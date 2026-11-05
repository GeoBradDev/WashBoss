import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/renderWithTheme'
import Gallery from './Gallery'

describe('Gallery', () => {
  it('renders 22 thumbnails', () => {
    renderWithTheme(<Gallery />)

    const thumbs = screen.getAllByRole('img', { name: 'Pressure washing job' })
    expect(thumbs).toHaveLength(22)
    expect(thumbs[0]).toHaveAttribute('src', expect.stringContaining('photo-01-thumb.webp'))
  })

  it('opens the lightbox on the clicked photo with a counter and closes it', async () => {
    const user = userEvent.setup()
    renderWithTheme(<Gallery />)

    const thumbs = screen.getAllByRole('img', { name: 'Pressure washing job' })
    await user.click(thumbs[4])

    expect(await screen.findByText('5 / 22')).toBeInTheDocument()
    const fullSize = document.querySelector('img[src$="photo-05.webp"]')
    expect(fullSize).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByText('5 / 22')).not.toBeInTheDocument()
    })
    expect(document.querySelector('img[src$="photo-05.webp"]')).toBeNull()
  })
})
