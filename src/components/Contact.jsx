import { useState } from 'react'
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

export default function Contact() {
  const [state, handleSubmit] = useForm('mvzbdanz')
  const [service, setService] = useState('')

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
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth required label="Your Name" name="name"
                    variant="outlined"
                  />
                  <ValidationError field="name" prefix="Name" errors={state.errors} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone Number" name="phone"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Property Address" name="address"
                    variant="outlined"
                    placeholder="Street address where service is needed"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth select label="Service Needed" name="service"
                    value={service} onChange={(e) => setService(e.target.value)}
                    variant="outlined"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline rows={4} label="Additional Details" name="message"
                    variant="outlined"
                    placeholder="Anything else we should know about your project?"
                  />
                  <ValidationError field="message" prefix="Message" errors={state.errors} />
                </Grid>
                <Grid item xs={12}>
                  {state.errors && state.errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Something went wrong. Please call us directly at (636) 614-8371.
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