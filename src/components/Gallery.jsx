import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Box, ButtonBase, Container, Grid, Typography } from '@mui/material'
import Lightbox from './Lightbox'

const BASE = import.meta.env.BASE_URL

// One description per photo, in file order (photo-01 to photo-22).
const ALTS = [
  'Two-story white house with a dark two-level deck and staircase',
  'Collage of five homes with clean siding, decks, and a brick chimney',
  'Stone retaining wall and patio beside wooden stairs, before and after cleaning',
  'Cream siding with dark mildew streaks above a patio, before and after washing',
  'Front concrete walkway beside a rock bed, before and after cleaning',
  'Brick home with a composite deck, stairs, and chimney',
  'Stained concrete driveway, before and after cleaning',
  'Yellow siding gable with mildew under string lights, before and after washing',
  'Wash Boss pickup truck and branded trailer parked on a residential street',
  'Pool diving board and deck, before and after cleaning',
  'Two-story gray home with a stone lower level and patio',
  'Yellow siding with green algae around a window, before and after washing',
  'Restaurant drive-through lane, wet after a night wash',
  'Sidewalk being cleaned with a surface cleaner, and the finished result',
  'Concrete walkway along a brick wall, before and after cleaning',
  'Back of a white-sided townhouse with string lights and steps, two views',
  'Concrete patio below a deck, before and after cleaning',
  'Front walkway with a landscape light, before and after cleaning',
  'Cream gable siding, clean on top and stained on the bottom',
  'White soffit, clean on top and covered in black mildew on the bottom',
  'Tan gable siding, clean on the left and streaked on the right',
  'Wet drive-through pavement with yellow striping outside a restaurant',
]

const PHOTOS = ALTS.map((alt, i) => {
  const n = String(i + 1).padStart(2, '0')
  return {
    src: `${BASE}photo-${n}.webp`,
    thumb: `${BASE}photo-${n}-thumb.webp`,
    alt,
  }
})

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState(null)
  // The thumbnail button that opened the lightbox. A click does not focus a
  // button in every browser (Safari), so focus is returned here explicitly.
  const openerRef = useRef(null)

  const handleOpen = (e, i) => {
    openerRef.current = e.currentTarget
    setOpenIndex(i)
  }

  // Commit the close first so the Modal has unmounted and removed aria-hidden
  // from the page before focus moves back to the thumbnail.
  const handleClose = () => {
    flushSync(() => setOpenIndex(null))
    openerRef.current?.focus()
    openerRef.current = null
  }

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
              <ButtonBase
                focusRipple
                aria-label={`Open photo ${i + 1} of ${PHOTOS.length}: ${photo.alt}`}
                onClick={(e) => handleOpen(e, i)}
                sx={{
                  display: 'block',
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  },
                  '&.Mui-focusVisible': {
                    outline: '3px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                {/* The button carries the name, so the image is decorative here. */}
                <Box
                  component="img"
                  src={photo.thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  sx={{
                    width: '100%',
                    aspectRatio: '4/3',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Lightbox
        photos={PHOTOS}
        index={openIndex}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </Box>
  )
}
