import { Box, Container, Grid, Typography } from '@mui/material'
import FireTruckIcon from '@mui/icons-material/FireTruck'
import VerifiedIcon from '@mui/icons-material/Verified'
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'

const TRUST_ITEMS = [
  {
    icon: <FireTruckIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Firefighter Owned',
    subtitle: 'Owned & operated by an active firefighter',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
    title: 'Licensed & Insured',
    subtitle: 'Fully licensed and insured for your protection',
  },
  {
    icon: <RequestQuoteIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Free Estimates',
    subtitle: 'No obligation estimates on all services',
  },
]

export default function TrustBar() {
  return (
    <Box sx={{ py: 6, backgroundColor: '#111111', borderTop: '1px solid #222', borderBottom: '1px solid #222' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          {TRUST_ITEMS.map((item) => (
            <Grid item xs={12} sm={4} key={item.title}>
              <Box sx={{ textAlign: 'center' }}>
                {item.icon}
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}