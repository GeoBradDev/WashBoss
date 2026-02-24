import { Box, Container, Grid, Card, CardContent, Typography, Chip } from '@mui/material'
import WaterIcon from '@mui/icons-material/Water'
import CloudIcon from '@mui/icons-material/Cloud'
import SquareFootIcon from '@mui/icons-material/SquareFoot'
import GridOnIcon from '@mui/icons-material/GridOn'

const SERVICES = [
  {
    icon: <WaterIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Pressure Washing',
    description:
      'High-powered cleaning for driveways, sidewalks, building exteriors, parking lots, and more. Removes dirt, grime, mold, and stains fast.',
  },
  {
    icon: <CloudIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
    title: 'Soft Washing',
    description:
      'Low-pressure cleaning safe for roofs, siding, painted surfaces, and delicate materials. Kills algae, mold, and mildew at the root.',
  },
  {
    icon: <SquareFootIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Concrete Sealing',
    description:
      'Professional-grade sealing that protects driveways, sidewalks, and concrete surfaces from stains, water damage, and freeze-thaw cycles.',
  },
  {
    icon: <GridOnIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
    title: 'Paver Sealing',
    description:
      'Enhance and protect your brick or stone pavers. Sealing locks in color, prevents weed growth, and extends the life of your investment.',
  },
]

export default function Services() {
  return (
    <Box id="services" sx={{ py: 10, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{ textAlign: 'center', mb: 1, color: 'primary.main' }}
        >
          Our Services
        </Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}
        >
          Professional cleaning and sealing for residential and commercial properties
        </Typography>

        <Grid container spacing={3}>
          {SERVICES.map((service) => (
            <Grid item xs={12} sm={6} key={service.title}>
              <Card
                sx={{
                  height: '100%',
                  p: 1,
                  transition: 'transform 0.2s, border-color 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardContent>
                  {service.icon}
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 1.5, mb: 1 }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Chip
            label="Serving Residential & Commercial Properties"
            sx={{
              backgroundColor: 'rgba(255,107,0,0.1)',
              border: '1px solid',
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.95rem',
              px: 2,
              py: 2.5,
            }}
          />
        </Box>
      </Container>
    </Box>
  )
}