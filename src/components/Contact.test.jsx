import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
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

function mockFetchReject(error) {
  const fetchMock = vi.fn().mockRejectedValue(error)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function mockFetchRawResponse(status, body, contentType) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(body, { status, headers: { 'Content-Type': contentType } }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function fillForm(user) {
  await user.type(screen.getByLabelText(/Your Name/), 'Test Customer')
  await user.type(screen.getByLabelText('Phone Number'), '5555550100')
  await user.type(screen.getByLabelText('Property Address'), '123 Test St')
  await user.click(screen.getByRole('combobox', { name: 'Service Needed' }))
  await user.click(await screen.findByRole('option', { name: 'Soft Washing' }))
  await user.type(screen.getByLabelText('Additional Details'), 'Driveway and patio')
}

function submitButton() {
  return screen.getByRole('button', { name: 'Request Free Estimate' })
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

  describe('failed submission', () => {
    it('shows an announced error alert with the phone fallback when the network fails, and keeps the entered data', async () => {
      mockFetchReject(new TypeError('Failed to fetch'))
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await fillForm(user)
      await user.click(submitButton())

      const alert = await screen.findByRole('alert')
      expect(alert).toHaveTextContent('(636) 614-8371')

      expect(submitButton()).toBeEnabled()
      expect(screen.getByLabelText(/Your Name/)).toHaveValue('Test Customer')
      expect(screen.getByLabelText('Phone Number')).toHaveValue('5555550100')
      expect(screen.getByLabelText('Property Address')).toHaveValue('123 Test St')
      expect(screen.getByLabelText('Additional Details')).toHaveValue('Driveway and patio')
      expect(screen.getByRole('combobox', { name: 'Service Needed' })).toHaveTextContent('Soft Washing')
    })

    it('shows the error alert for a 5xx response with form-level errors', async () => {
      mockFetchResponse(500, { errors: [{ message: 'Internal error' }] })
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await fillForm(user)
      await user.click(submitButton())

      expect(await screen.findByRole('alert')).toHaveTextContent('(636) 614-8371')
      expect(screen.getByLabelText(/Your Name/)).toHaveValue('Test Customer')
    })

    it('shows the error alert for a 4xx response with form-level errors', async () => {
      mockFetchResponse(403, { errors: [{ code: 'INACTIVE', message: 'Form not active' }] })
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await fillForm(user)
      await user.click(submitButton())

      expect(await screen.findByRole('alert')).toHaveTextContent('(636) 614-8371')
    })

    it('shows the error alert for a 5xx response with a non-JSON body', async () => {
      mockFetchRawResponse(502, '<html><body>Bad Gateway</body></html>', 'text/html')
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await fillForm(user)
      await user.click(submitButton())

      expect(await screen.findByRole('alert')).toHaveTextContent('(636) 614-8371')
    })

    it('shows the general alert as well as the inline message for a field-only 422', async () => {
      mockFetchResponse(422, {
        errors: [{ field: 'name', code: 'REQUIRED_FIELD_EMPTY', message: 'should be filled out' }],
      })
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.click(submitButton())

      expect(await screen.findByText('Name should be filled out')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('(636) 614-8371')
    })

    it('hides the alert while a retry is submitting and shows success when the retry succeeds', async () => {
      let resolveRetry
      const fetchMock = vi.fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockImplementationOnce(() => new Promise((resolve) => { resolveRetry = resolve }))
      vi.stubGlobal('fetch', fetchMock)
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await fillForm(user)
      await user.click(submitButton())
      expect(await screen.findByRole('alert')).toBeInTheDocument()

      await user.click(submitButton())
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      resolveRetry(new Response(JSON.stringify({ next: 'https://formspree.io/thanks', ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      expect(await screen.findByText(/Message sent!/)).toBeInTheDocument()
      expect(screen.queryByText(/614-8371/)).not.toBeInTheDocument()
    })
  })
})
