import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithTheme } from '../test/renderWithTheme'
import { axeViolations } from '../test/axe'
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

  it('shows the field-level error next to Name when Formspree rejects the name', async () => {
    mockFetchResponse(422, {
      errors: [{ field: 'name', code: 'REQUIRED_FIELD_EMPTY', message: 'should be filled out' }],
    })
    const user = userEvent.setup()
    renderWithTheme(<Contact />)

    await user.type(screen.getByLabelText(/Your Name/), 'Test Customer')
    await user.type(screen.getByLabelText('Phone Number'), '5555550100')
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

      await user.type(screen.getByLabelText(/Your Name/), 'Test Customer')
      await user.type(screen.getByLabelText('Phone Number'), '5555550100')
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

    it('removes the alert during a retry and shows it again when the retry also fails', async () => {
      let rejectRetry
      const fetchMock = vi.fn()
        .mockRejectedValueOnce(new TypeError('Failed to fetch'))
        .mockImplementationOnce(() => new Promise((resolve, reject) => { rejectRetry = reject }))
      vi.stubGlobal('fetch', fetchMock)
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await fillForm(user)
      await user.click(submitButton())
      const firstAlert = await screen.findByRole('alert')

      await user.click(submitButton())
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()

      rejectRetry(new TypeError('Failed to fetch'))

      const secondAlert = await screen.findByRole('alert')
      expect(secondAlert).toHaveTextContent('(636) 614-8371')
      // A new element, so assistive technology announces the second failure.
      expect(secondAlert).not.toBe(firstAlert)
      expect(screen.getByLabelText(/Your Name/)).toHaveValue('Test Customer')
    })
  })

  describe('client-side validation (#3)', () => {
    const EITHER = 'Enter a phone number or an email. Either one is enough.'
    const NAME_ERROR = 'Enter your name.'
    const EMAIL_FORMAT = 'Enter a valid email address, like name@example.com.'
    const DEFAULT_HINT = 'Phone or email required.'

    const nameField = () => screen.getByRole('textbox', { name: /Your Name/ })
    const phoneField = () => screen.getByRole('textbox', { name: 'Phone Number' })
    const emailField = () => screen.getByRole('textbox', { name: 'Email' })

    function stubFetch() {
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)
      return fetchMock
    }

    it('blocks an empty submit, marks Name, Phone, and Email invalid, and focuses Name', async () => {
      const fetchMock = stubFetch()
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.click(submitButton())

      expect(nameField()).toBeInvalid()
      expect(nameField()).toHaveAccessibleDescription(NAME_ERROR)
      expect(phoneField()).toBeInvalid()
      expect(phoneField()).toHaveAccessibleDescription(EITHER)
      expect(emailField()).toBeInvalid()
      expect(emailField()).toHaveAccessibleDescription(EITHER)
      expect(nameField()).toHaveFocus()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('blocks a submit with only a name and asks for a phone or email', async () => {
      const fetchMock = stubFetch()
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.type(nameField(), 'Test Customer')
      await user.click(submitButton())

      expect(nameField()).not.toBeInvalid()
      expect(phoneField()).toBeInvalid()
      expect(phoneField()).toHaveAccessibleDescription(EITHER)
      expect(emailField()).toBeInvalid()
      expect(emailField()).toHaveAccessibleDescription(EITHER)
      expect(phoneField()).toHaveFocus()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('treats a whitespace-only phone and email as empty', async () => {
      const fetchMock = stubFetch()
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.type(nameField(), 'Test Customer')
      await user.type(phoneField(), '   ')
      await user.type(emailField(), '   ')
      await user.click(submitButton())

      expect(phoneField()).toBeInvalid()
      expect(phoneField()).toHaveAccessibleDescription(EITHER)
      expect(emailField()).toBeInvalid()
      expect(emailField()).toHaveAccessibleDescription(EITHER)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('blocks a submit with a phone and email but no name, and focuses Name', async () => {
      const fetchMock = stubFetch()
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.type(phoneField(), '5555550100')
      await user.type(emailField(), 'test@example.com')
      await user.click(submitButton())

      expect(nameField()).toBeInvalid()
      expect(nameField()).toHaveAccessibleDescription(NAME_ERROR)
      expect(phoneField()).not.toBeInvalid()
      expect(emailField()).not.toBeInvalid()
      expect(nameField()).toHaveFocus()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('blocks an invalid email even when a phone is given, and focuses Email', async () => {
      const fetchMock = stubFetch()
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.type(nameField(), 'Test Customer')
      await user.type(phoneField(), '5555550100')
      await user.type(emailField(), 'not-an-email')
      await user.click(submitButton())

      expect(emailField()).toBeInvalid()
      expect(emailField()).toHaveAccessibleDescription(EMAIL_FORMAT)
      expect(nameField()).not.toBeInvalid()
      expect(phoneField()).not.toBeInvalid()
      expect(emailField()).toHaveFocus()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('clears errors as the user types after a failed submit', async () => {
      stubFetch()
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.click(submitButton())
      expect(nameField()).toBeInvalid()

      await user.type(nameField(), 'Test Customer')
      expect(nameField()).not.toBeInvalid()
      expect(nameField()).not.toHaveAccessibleDescription()
      expect(phoneField()).toBeInvalid()

      await user.type(phoneField(), '5555550100')
      expect(phoneField()).not.toBeInvalid()
      expect(phoneField()).toHaveAccessibleDescription(DEFAULT_HINT)
      expect(emailField()).not.toBeInvalid()
      expect(emailField()).toHaveAccessibleDescription(DEFAULT_HINT)
    })

    it('shows no errors before the first submit and states the phone-or-email rule', () => {
      renderWithTheme(<Contact />)

      expect(nameField()).not.toHaveAttribute('aria-invalid', 'true')
      expect(phoneField()).not.toHaveAttribute('aria-invalid', 'true')
      expect(emailField()).not.toHaveAttribute('aria-invalid', 'true')
      expect(phoneField()).toHaveAccessibleDescription(DEFAULT_HINT)
      expect(emailField()).toHaveAccessibleDescription(DEFAULT_HINT)
    })

    it('submits with a name and email only and sends the email and an empty honeypot', async () => {
      const fetchMock = mockFetchResponse(200, { next: 'https://formspree.io/thanks', ok: true })
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.type(nameField(), 'Test Customer')
      await user.type(emailField(), 'test@example.com')
      await user.click(submitButton())

      expect(await screen.findByText(/Message sent!/)).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toContain('formspree.io/f/xqedwlwr')
      expect(init.method).toBe('POST')
      expect(init.body.get('email')).toBe('test@example.com')
      expect(init.body.get('_gotcha')).toBe('')
    })

    it('submits with a name and phone only and sends an empty email and honeypot', async () => {
      const fetchMock = mockFetchResponse(200, { next: 'https://formspree.io/thanks', ok: true })
      const user = userEvent.setup()
      renderWithTheme(<Contact />)

      await user.type(nameField(), 'Test Customer')
      await user.type(phoneField(), '5555550100')
      await user.click(submitButton())

      expect(await screen.findByText(/Message sent!/)).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toContain('formspree.io/f/xqedwlwr')
      const body = init.body
      expect(body.get('name')).toBe('Test Customer')
      expect(body.get('phone')).toBe('5555550100')
      expect(body.get('email')).toBe('')
      expect(body.get('_gotcha')).toBe('')
      for (const key of ['address', 'service', 'message']) {
        expect(body.has(key)).toBe(true)
      }
    })

    it('gives every field an id, a name, and an autocomplete token', () => {
      const { container } = renderWithTheme(<Contact />)
      const expected = [
        { id: 'contact-name', name: 'name', autocomplete: 'name' },
        { id: 'contact-phone', name: 'phone', autocomplete: 'tel', type: 'tel', inputmode: 'tel' },
        { id: 'contact-email', name: 'email', autocomplete: 'email', type: 'email' },
        { id: 'contact-address', name: 'address', autocomplete: 'street-address' },
        { id: 'contact-message', name: 'message' },
      ]
      for (const { id, ...attrs } of expected) {
        const el = container.querySelector(`#${id}`)
        expect(el, id).not.toBeNull()
        for (const [attr, value] of Object.entries(attrs)) {
          expect(el.getAttribute(attr), `${id} ${attr}`).toBe(value)
        }
      }
      expect(emailField()).toHaveAttribute('id', 'contact-email')
      expect(screen.getByText('Email', { selector: 'label' })).toBeInTheDocument()

      const service = container.querySelector('input[name="service"]')
      expect(service).not.toBeNull()
      expect(container.querySelector('#contact-service')).not.toBeNull()
    })

    it('includes a hidden Formspree honeypot that is not a textbox and is skipped by Tab', async () => {
      const user = userEvent.setup()
      const { container } = renderWithTheme(<Contact />)

      const gotcha = container.querySelector('input[name="_gotcha"]')
      expect(gotcha).not.toBeNull()
      expect(gotcha).toHaveAttribute('id', 'contact-gotcha')
      expect(gotcha).toHaveAttribute('type', 'text')
      expect(gotcha).toHaveAttribute('tabindex', '-1')
      expect(gotcha).toHaveAttribute('aria-hidden', 'true')
      expect(gotcha).toHaveAttribute('autocomplete', 'off')
      expect(gotcha).not.toHaveAttribute('style')
      expect(gotcha).not.toBeVisible()
      expect(screen.getAllByRole('textbox')).not.toContain(gotcha)

      nameField().focus()
      const visited = []
      for (let i = 0; i < 10 && document.activeElement !== submitButton(); i += 1) {
        await user.tab()
        visited.push(document.activeElement)
      }
      expect(visited).toContain(submitButton())
      expect(visited).not.toContain(gotcha)
    })

    it('has no axe violations before and after a failed submit', async () => {
      stubFetch()
      const user = userEvent.setup()
      const { container } = renderWithTheme(<Contact />)
      // heading-order (h2 to h4 in the left column) predates #3 and is out of scope.
      const rules = { region: { enabled: false }, 'heading-order': { enabled: false } }

      expect(emailField()).toBeInTheDocument()
      expect(await axeViolations(container, rules)).toEqual([])

      await user.click(submitButton())
      expect(nameField()).toBeInvalid()
      expect(await axeViolations(container, rules)).toEqual([])
    })
  })
})
