import { useState } from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import Lightbox from './Lightbox'

const BASE = import.meta.env.BASE_URL

const PHOTOS = Array.from({ length: 22 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0')
  return {
    src: `${BASE}photo-${n}.webp`,
    thumb: `${BASE}photo-${n}-thumb.webp`,
    alt: 'Pressure washing job',
  }
})

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null)

  const handlePrev = () =>
    setOpenIndex((i) => (i + PHOTOS.length - 1) % PHOTOS.length)
  const handleNext = () =>
    setOpenIndex((i) => (i + 1) % PHOTOS.length)

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
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Box
                component="img"
                src={photo.thumb}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                onClick={() => setOpenIndex(i)}
                sx={{
                  width: '100%',
                  aspectRatio: '4/3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  cursor: 'pointer',
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

      <Lightbox
        photos={PHOTOS}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </Box>
  )
}
