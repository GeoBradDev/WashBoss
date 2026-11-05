import { Box, Container, Typography, Divider } from '@mui/material'
import { logoSrc, logoSrcSet, FOOTER_LOGO_SIZES } from '../logo'

export default function Footer() {
  return (
    <Box component="footer" sx={{ backgroundColor: '#080808', borderTop: '1px solid #1a1a1a', pt: 6, pb: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src={logoSrc(168)}
            srcSet={logoSrcSet}
            sizes={FOOTER_LOGO_SIZES}
            alt="Wash Boss Pressure Washing"
            loading="lazy"
            decoding="async"
            sx={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', mb: 2 }}
          />
          <Typography variant="h5" component="p" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
            Wash Boss Pressure Washing LLC
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Firefighter Owned & Operated — St. Louis, MO
          </Typography>
          <Typography
            component="a"
            href="tel:6366148371"
            variant="body1"
            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
          >
            (636) 614-8371
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#1a1a1a', mb: 3 }} />

        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Wash Boss Pressure Washing LLC. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}