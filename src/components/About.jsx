import { Box, Container, Grid, Typography, Divider } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import StarIcon from '@mui/icons-material/Star'
import HandshakeIcon from '@mui/icons-material/Handshake'

export default function About() {
  return (
    <Box
      id="about"
      sx={{
        py: 10,
        backgroundColor: '#0d0d0d',
        borderTop: '1px solid #222',
        borderBottom: '1px solid #222',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">

          {/* Left: Firefighter visual */}
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,107,0,0.05))',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 0 60px rgba(255,107,0,0.2)',
                  mb: 3,
                }}
              >
                <LocalFireDepartmentIcon sx={{ fontSize: 100, color: 'primary.main' }} />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                Firefighter Owned
              </Typography>
              <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                & Operated
              </Typography>

              <Divider sx={{ my: 3, borderColor: '#333' }} />

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <StarIcon sx={{ color: 'primary.main', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Top Quality</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <HandshakeIcon sx={{ color: 'secondary.main', mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Community First</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right: Story */}
          <Grid item xs={12} md={7}>
            <Typography variant="h2" sx={{ mb: 3, color: 'primary.main' }}>
              About Wash Boss
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, mb: 3 }}>
              My name is <strong style={{ color: '#ffffff' }}>D&apos;Marco Shivers</strong>, and I&apos;m the
              Owner/Operator of Wash Boss Pressure Washing LLC. As an active
              firefighter, I bring the same dedication, discipline, and commitment to
              excellence that I bring to the fire station — to every single job.
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, mb: 3 }}>
              We are <strong style={{ color: '#ffffff' }}>fully licensed and insured</strong>, specializing in
              pressure washing, soft washing, concrete sealing, and paver sealing
              for both residential and commercial properties — from homes and
              driveways to gas stations, apartment complexes, and fast-food
              restaurants.
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.9, mb: 4 }}>
              We take great pride in the quality of our work and our commitment to
              excellent customer service. We&apos;d love the opportunity to earn your
              business and get you scheduled for this season.
            </Typography>

            <Box
              sx={{
                display: 'inline-block',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 3,
                py: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                D&apos;Marco Shivers
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.main' }}>
                Owner / Operator — Wash Boss Pressure Washing LLC
              </Typography>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  )
}