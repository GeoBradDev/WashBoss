import { Box, Container, Grid, Typography } from '@mui/material'

const PHOTOS = [
  { src: '/washboss/photo-01.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-02.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-03.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-04.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-05.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-06.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-07.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-08.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-09.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-10.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-11.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-12.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-13.jpeg', alt: 'Pressure washing job' },
  { src: '/washboss/photo-14.jpeg', alt: 'Pressure washing job' },
]

export default function Gallery() {
  return (
    <Box id="gallery" sx={{ py: 10, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 1, color: 'primary.main' }}>
          Our Work
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Real results from real jobs across the St. Louis area
        </Typography>

        <Grid container spacing={2}>
          {PHOTOS.map((photo, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Box
                component="img"
                src={photo.src}
                alt={photo.alt}
                sx={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}