import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/renderWithTheme'
import Contact from './Contact'

function mockFetchResponse(status, body) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Contact form', () => {
  it('posts to the Formspree form and shows the success message', async () => {
    const fetchMock = mockFetchResponse(200, { next: 'https://formspree.io/thanks', ok: true })
    const user = userEvent.setup()
    renderWithTheme(<Contact />)

    await user.type(screen.getByLabelText(/Your Name/), 'Test Customer')
    await user.type(screen.getByLabelText('Phone Number'), '5555550100')
    await user.click(screen.getByRole('button', { name: 'Request Free Estimate' }))

    expect(await screen.findByText(/Message sent!/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Request Free Estimate' })).not.toBeInTheDocument()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('formspree.io/f/xqedwlwr')
    expect(init.method).toBe('POST')
  })

  it('shows the field-level error next to Name when Formspree rejects an empty name', async () => {
    mockFetchResponse(422, {
      errors: [{ field: 'name', code: 'REQUIRED_FIELD_EMPTY', message: 'should be filled out' }],
    })
    const user = userEvent.setup()
    renderWithTheme(<Contact />)

    await user.click(screen.getByRole('button', { name: 'Request Free Estimate' }))

    await screen.findByText('Name should be filled out')

    // The message must render in the same grid cell as the Name input,
    // not elsewhere on the page.
    const nameInput = screen.getByRole('textbox', { name: /Your Name/ })
    const nameCell = nameInput.closest('.MuiGrid-root')
    expect(nameCell).not.toBeNull()
    expect(within(nameCell).getByText('Name should be filled out')).toBeInTheDocument()

    const phoneCell = screen.getByRole('textbox', { name: 'Phone Number' }).closest('.MuiGrid-root')
    expect(within(phoneCell).queryByText('Name should be filled out')).not.toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Request Free Estimate' })).toBeInTheDocument()
  })
})
