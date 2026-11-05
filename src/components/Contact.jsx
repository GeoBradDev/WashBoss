import { useRef, useState } from 'react'
import { useForm, ValidationError } from '@formspree/react'
import {
  Box, Container, Grid, Typography, TextField, Button,
  MenuItem, CircularProgress, Alert,
} from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const SERVICE_TYPES = [
  'Pressure Washing',
  'Soft Washing',
  'Concrete Sealing',
  'Paver Sealing',
  'Multiple Services',
  'Not Sure — Need Advice',
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CONTACT_HINT = 'Phone or email required.'

// Returns an error message per invalid field: Name is required, and the
// customer must leave a phone or a well-formed email so we can reply.
function validateContact({ name, phone, email }) {
  const errors = {}
  const trimmedEmail = email.trim()
  if (!name.trim()) errors.name = 'Enter your name.'
  if (!phone.trim() && !trimmedEmail) {
    const message = 'Enter a phone number or an email. Either one is enough.'
    errors.phone = message
    errors.email = message
  } else if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address, like name@example.com.'
  }
  return errors
}

export default function Contact() {
  const [state, handleSubmit, reset] = useForm('xqedwlwr')
  const [service, setService] = useState('')
  const [values, setValues] = useState({ name: '', phone: '', email: '' })
  const [showErrors, setShowErrors] = useState(false)
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)

  // Derived during render: errors only show after the first failed submit,
  // then update as the user types.
  const errors = showErrors ? validateContact(values) : {}

  const updateValue = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (event) => {
    const found = validateContact(values)
    if (found.name || found.phone || found.email) {
      event.preventDefault()
      setShowErrors(true)
      // Drop errors from an earlier Formspree request so its alert and
      // inline 422 text do not sit next to the new browser errors.
      reset()
      const firstInvalid = found.name ? nameRef : found.phone ? phoneRef : emailRef
      firstInvalid.current?.focus()
      return
    }
    // Read the form synchronously: event.currentTarget is null after an await.
    const data = new FormData(event.currentTarget)
    event.preventDefault()
    // Send the trimmed email, and leave it out when blank: Formspree treats
    // an email field as the reply-to address and validates it.
    const trimmedEmail = values.email.trim()
    if (trimmedEmail) data.set('email', trimmedEmail)
    else data.delete('email')
    handleSubmit(data)
  }

  if (state.succeeded) {
    return (
      <Box id="contact" sx={{ py: 10, backgroundColor: '#0d0d0d', borderTop: '1px solid #222' }}>
        <Container maxWidth="lg">
          <Alert severity="success" sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem', py: 3 }}>
            Message sent! We&apos;ll be in touch soon to schedule your free estimate.
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box id="contact" sx={{ py: 10, backgroundColor: '#0d0d0d', borderTop: '1px solid #222' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 1, color: 'primary.main' }}>
          Get in Touch
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 8 }}>
          Ready for a free estimate? Call, text, or fill out the form below.
        </Typography>

        <Grid container spacing={8} alignItems="flex-start">

          {/* Left: Phone + Location */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 5 }}>
              <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Call or Text
              </Typography>
              <Typography
                component="a"
                href="tel:6366148371"
                variant="h4"
                sx={{
                  color: 'primary.main',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'block',
                  mb: 2,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                (636) 614-8371
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PhoneIcon />}
                component="a"
                href="tel:6366148371"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Call Now — It&apos;s Free
              </Button>
            </Box>

            <Box>
              <LocationOnIcon sx={{ fontSize: 36, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Service Area
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                St. Louis, MO and surrounding areas<br />
                Residential & Commercial
              </Typography>
            </Box>
          </Grid>

          {/* Right: Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box component="form" onSubmit={onSubmit} noValidate>
              {/* Formspree honeypot: bots fill it, people never see it. Hidden by a
                  generated class, not an inline style, per Formspree's docs. */}
              <Box
                component="input"
                type="text"
                name="_gotcha"
                id="contact-gotcha"
                tabIndex={-1}
                aria-hidden="true"
                autoComplete="off"
                sx={{ display: 'none' }}
              />
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth required label="Your Name" name="name" id="contact-name"
                    autoComplete="name"
                    variant="outlined"
                    value={values.name} onChange={updateValue}
                    inputRef={nameRef}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                  />
                  <ValidationError field="name" prefix="Name" errors={state.errors} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth label="Phone Number" name="phone" id="contact-phone"
                    type="tel" autoComplete="tel"
                    slotProps={{ htmlInput: { inputMode: 'tel' } }}
                    variant="outlined"
                    value={values.phone} onChange={updateValue}
                    inputRef={phoneRef}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone ?? CONTACT_HINT}
                  />
                  <ValidationError field="phone" prefix="Phone" errors={state.errors} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth label="Email" name="email" id="contact-email"
                    type="email" autoComplete="email"
                    variant="outlined"
                    value={values.email} onChange={updateValue}
                    inputRef={emailRef}
                    error={Boolean(errors.email)}
                    helperText={errors.email ?? CONTACT_HINT}
                  />
                  <ValidationError field="email" prefix="Email" errors={state.errors} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth label="Property Address" name="address" id="contact-address"
                    autoComplete="street-address"
                    variant="outlined"
                    placeholder="Street address where service is needed"
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth select label="Service Needed" name="service" id="contact-service"
                    value={service} onChange={(e) => setService(e.target.value)}
                    variant="outlined"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth multiline rows={4} label="Additional Details" name="message"
                    id="contact-message"
                    // A plain textarea: MUI's autosize version adds a shadow textarea
                    // with no id or name, which Chrome flags as a form field issue.
                    slotProps={{ input: { inputComponent: 'textarea' } }}
                    variant="outlined"
                    placeholder="Anything else we should know about your project?"
                  />
                  <ValidationError field="message" prefix="Message" errors={state.errors} />
                </Grid>
                <Grid size={12}>
                  {/* state.errors is a SubmissionError object (or null), set for network
                      failures, form-level errors, and field errors alike. Hidden while a
                      retry is submitting so the next failure is announced again. */}
                  {state.errors && !state.submitting && (
                    <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                      We could not confirm your request was received. Please try again, or call us directly at (636) 614-8371.
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={state.submitting}
                    sx={{ py: 1.75, fontSize: '1.1rem' }}
                  >
                    {state.submitting
                      ? <CircularProgress size={24} color="inherit" />
                      : 'Request Free Estimate'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  )
}