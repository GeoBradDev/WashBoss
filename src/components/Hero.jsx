import { Box, Typography, Button, Stack } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import AssignmentIcon from '@mui/icons-material/Assignment'

export default function Hero() {
  const handleScrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Box
      id="hero"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2,
        pt: 10,
        background: 'radial-gradient(ellipse at center, #1a0a00 0%, #0a0a0a 70%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Orange glow effect */}
      <Box sx={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}SCSL.jpeg`}
        alt="Wash Boss Pressure Washing Logo"
        sx={{
          width: { xs: 160, md: 220 },
          height: { xs: 160, md: 220 },
          borderRadius: '50%',
          objectFit: 'cover',
          mb: 4,
          border: '3px solid',
          borderColor: 'primary.main',
          boxShadow: '0 0 40px rgba(255,107,0,0.3)',
        }}
      />

      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' },
          fontWeight: 900,
          lineHeight: 1.1,
          mb: 2,
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF9A00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        St. Louis&apos;s Premier<br />Pressure Washing Experts
      </Typography>

      <Typography
        variant="h5"
        sx={{ color: 'text.secondary', mb: 1, maxWidth: 600, fontWeight: 400 }}
      >
        Firefighter-Owned & Operated. Licensed & Insured.
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: 'text.secondary', mb: 5, maxWidth: 500 }}
      >
        Serving residential and commercial properties across the St. Louis area.
        We take pride in the quality of our work and your satisfaction.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<PhoneIcon />}
          component="a"
          href="tel:6366148371"
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Call (636) 614-8371
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<AssignmentIcon />}
          onClick={() => handleScrollTo('contact')}
          sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
        >
          Get Free Estimate
        </Button>
      </Stack>
    </Box>
  )
}