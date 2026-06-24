import { useEffect } from 'react'
import { Modal, Box, IconButton, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'

const controlSx = {
  position: 'absolute',
  color: 'white',
  bgcolor: 'rgba(0,0,0,0.4)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.6)', color: 'primary.main' },
}

export default function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  const open = index !== null

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose, onPrev, onNext])

  if (!open) return null

  const photo = photos[index]

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        sx={{
          position: 'relative',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="img"
          src={photo.src}
          alt={photo.alt}
          sx={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 1,
            display: 'block',
          }}
        />

        <IconButton
          aria-label="Previous photo"
          onClick={onPrev}
          sx={{ ...controlSx, left: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronLeftIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <IconButton
          aria-label="Next photo"
          onClick={onNext}
          sx={{ ...controlSx, right: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronRightIcon sx={{ fontSize: 32 }} />
        </IconButton>

        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ ...controlSx, top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {index + 1} / {photos.length}
        </Typography>
      </Box>
    </Modal>
  )
}
