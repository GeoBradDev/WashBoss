# Wash Boss Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page business website for Wash Boss Pressure Washing LLC deployed on GitHub Pages.

**Architecture:** Single-page React app with smooth-scroll sections. MUI v6 with a fully custom theme matching the brand (black/orange/blue). No backend — Formspree handles the contact form. Vite builds the static output, `gh-pages` deploys it.

**Tech Stack:** React 19, Vite 8, MUI v6, Formspree (free), gh-pages

---

## Reference: Design Doc

Full design spec: `docs/plans/2026-02-24-washboss-website-design.md`

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install MUI, icons, and gh-pages**

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install --save-dev gh-pages
```

**Step 2: Verify install**

Run: `npm ls @mui/material`
Expected: `@mui/material@6.x.x` listed with no peer dep errors

---

### Task 2: Configure Vite for GitHub Pages

**Files:**
- Modify: `vite.config.js`

**Step 1: Update vite.config.js**

Replace the contents of `vite.config.js` with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/washboss/',
})
```

> Note: `base` must match the GitHub repository name exactly. If the repo is named something other than `washboss`, update this value.

**Step 2: Add deploy scripts to package.json**

In `package.json`, update the `"scripts"` section to add:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Final scripts section:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

**Step 3: Verify build runs**

Run: `npm run build`
Expected: `dist/` folder created, no errors

---

### Task 3: Create MUI Custom Theme

**Files:**
- Create: `src/theme.js`

**Step 1: Create theme file**

```js
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B00',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1E9FD4',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a0a',
      paper: '#141414',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#141414',
          border: '1px solid #222222',
        },
      },
    },
  },
})

export default theme
```

**Step 2: Wire theme into main.jsx**

Replace `src/main.jsx` with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

**Step 3: Verify dev server runs with dark background**

Run: `npm run dev`
Expected: Page loads at `http://localhost:5173` with dark background, no console errors

---

### Task 4: Build Navbar Component

**Files:**
- Create: `src/components/Navbar.jsx`

**Step 1: Create the component**

```jsx
import { useState } from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useScrollTrigger, Slide,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger()
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleNavClick = (href) => {
    setDrawerOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        sx={{ backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(8px)', boxShadow: 'none', borderBottom: '1px solid #222' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Box
            component="img"
            src="/washboss/SCSL.jpeg"
            alt="Wash Boss Pressure Washing"
            sx={{ height: 56, width: 56, borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                {link.label}
              </Button>
            ))}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleNavClick('#contact')}
              sx={{ ml: 2 }}
            >
              Get a Free Quote
            </Button>
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'primary.main' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* Mobile drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { backgroundColor: 'background.default', width: 240 } }}
        >
          <List sx={{ pt: 4 }}>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton onClick={() => handleNavClick(link.href)}>
                  <ListItemText primary={link.label} sx={{ color: 'text.primary' }} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem sx={{ pt: 2 }}>
              <Button
                fullWidth variant="contained" color="primary"
                onClick={() => handleNavClick('#contact')}
              >
                Get a Free Quote
              </Button>
            </ListItem>
          </List>
        </Drawer>
      </AppBar>
    </HideOnScroll>
  )
}
```

**Step 2: Add to App.jsx temporarily to verify**

In `src/App.jsx`, replace everything with:

```jsx
import Navbar from './components/Navbar'

export default function App() {
  return (
    <>
      <Navbar />
      <div style={{ height: '200vh', paddingTop: 80 }}>Scroll test</div>
    </>
  )
}
```

**Step 3: Verify in browser**

Run: `npm run dev`
Expected: Sticky dark navbar with logo, nav links (desktop), hamburger (mobile at narrow width), orange "Get a Free Quote" button

---

### Task 5: Build Hero Component

**Files:**
- Create: `src/components/Hero.jsx`

**Step 1: Create the component**

```jsx
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
        src="/washboss/SCSL.jpeg"
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
```

**Step 2: Add to App.jsx**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  )
}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: Full-height dark hero with logo, orange gradient headline, two CTA buttons, orange glow effect

---

### Task 6: Build TrustBar Component

**Files:**
- Create: `src/components/TrustBar.jsx`

**Step 1: Create the component**

```jsx
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
```

**Step 2: Add to App.jsx**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
    </>
  )
}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: Three-column trust bar below hero with icons and text

---

### Task 7: Build Services Component

**Files:**
- Create: `src/components/Services.jsx`

**Step 1: Create the component**

```jsx
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
```

**Step 2: Add to App.jsx**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
    </>
  )
}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: 2x2 card grid with service cards that lift on hover, orange/blue icons, chip at bottom

---

### Task 8: Build About Component

**Files:**
- Create: `src/components/About.jsx`

**Step 1: Create the component**

```jsx
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
```

**Step 2: Add to App.jsx**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import About from './components/About'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <About />
    </>
  )
}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: Two-column section — firefighter icon with glow on left, D'Marco's story on right, orange accent colors

---

### Task 9: Build Gallery Component

**Files:**
- Create: `src/components/Gallery.jsx`

**Step 1: Create the component**

```jsx
import { Box, Container, Grid, Typography, Paper } from '@mui/material'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'

const PLACEHOLDER_COUNT = 6

export default function Gallery() {
  return (
    <Box id="gallery" sx={{ py: 10, backgroundColor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ textAlign: 'center', mb: 1, color: 'primary.main' }}>
          Our Work
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 6 }}>
          Photos coming soon — check back to see our latest jobs
        </Typography>

        <Grid container spacing={2}>
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Paper
                sx={{
                  aspectRatio: '4/3',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#141414',
                  border: '2px dashed #333',
                  borderRadius: 2,
                  cursor: 'default',
                  gap: 1,
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 40, color: '#444' }} />
                <Typography variant="body2" sx={{ color: '#555' }}>
                  Photo Coming Soon
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
```

> **Note for later:** To add real photos, replace each `<Paper>` placeholder with:
> ```jsx
> <Box component="img" src="/washboss/photos/job1.jpg" alt="Job description"
>   sx={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 2 }} />
> ```

**Step 2: Add to App.jsx**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import About from './components/About'
import Gallery from './components/Gallery'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <About />
      <Gallery />
    </>
  )
}
```

**Step 3: Verify**

Run: `npm run dev`
Expected: 3x2 grid of dashed-border placeholder cards with camera icon

---

### Task 10: Build Contact Component

**Files:**
- Create: `src/components/Contact.jsx`

**Step 1: Sign up for Formspree**

1. Go to https://formspree.io and create a free account
2. Create a new form — it will give you a form endpoint like `https://formspree.io/f/XXXXXXXX`
3. Replace `YOUR_FORMSPREE_ID` in the component below with your form ID (the `XXXXXXXX` part)

**Step 2: Create the component**

```jsx
import { useState } from 'react'
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

const FORMSPREE_ID = 'YOUR_FORMSPREE_ID' // Replace with your Formspree form ID

export default function Contact() {
  const [form, setForm] = useState({
    name: '', phone: '', address: '', service: '', message: '',
  })
  const [status, setStatus] = useState('idle') // idle | submitting | success | error

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', phone: '', address: '', service: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
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
                    value={form.name} onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth label="Phone Number" name="phone"
                    value={form.phone} onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Property Address" name="address"
                    value={form.address} onChange={handleChange}
                    variant="outlined"
                    placeholder="Street address where service is needed"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth select label="Service Needed" name="service"
                    value={form.service} onChange={handleChange}
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
                    value={form.message} onChange={handleChange}
                    variant="outlined"
                    placeholder="Anything else we should know about your project?"
                  />
                </Grid>
                <Grid item xs={12}>
                  {status === 'success' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Message sent! We&apos;ll be in touch soon to schedule your free estimate.
                    </Alert>
                  )}
                  {status === 'error' && (
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
                    disabled={status === 'submitting'}
                    sx={{ py: 1.75, fontSize: '1.1rem' }}
                  >
                    {status === 'submitting'
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
```

**Step 3: Add to App.jsx**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import About from './components/About'
import Gallery from './components/Gallery'
import Contact from './components/Contact'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <About />
      <Gallery />
      <Contact />
    </>
  )
}
```

**Step 4: Verify**

Run: `npm run dev`
Expected: Two-column contact section — large phone number + tap-to-call on left, full form on right

---

### Task 11: Build Footer Component

**Files:**
- Create: `src/components/Footer.jsx`

**Step 1: Create the component**

```jsx
import { Box, Container, Typography, Divider } from '@mui/material'

export default function Footer() {
  return (
    <Box sx={{ backgroundColor: '#080808', borderTop: '1px solid #1a1a1a', pt: 6, pb: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/washboss/SCSL.jpeg"
            alt="Wash Boss Pressure Washing"
            sx={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', mb: 2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
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

        <Typography variant="body2" sx={{ color: '#555', textAlign: 'center' }}>
          &copy; {new Date().getFullYear()} Wash Boss Pressure Washing LLC. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}
```

**Step 2: Assemble final App.jsx**

Replace `src/App.jsx` entirely with the final version:

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import About from './components/About'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <TrustBar />
      <Services />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </>
  )
}
```

**Step 3: Clean up unused files**

Delete the default boilerplate files that are no longer needed:
- `src/App.css` — no longer used
- `src/index.css` — replaced by CssBaseline

Update `src/main.jsx` to ensure it does NOT import `index.css` (it should already be replaced from Task 3).

**Step 4: Verify full page**

Run: `npm run dev`
Expected: Full single-page site scrolls through all sections with consistent dark theme

---

### Task 12: Deploy to GitHub Pages

**Files:**
- (GitHub repository required)

**Step 1: Create a GitHub repository**

1. Go to https://github.com/new
2. Create a new repository named `washboss` (must match the `base` in vite.config.js)
3. Keep it public (required for free GitHub Pages)

**Step 2: Initialize git and push**

```bash
git init
git add .
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/washboss.git
git branch -M main
git push -u origin main
```

**Step 3: Deploy**

```bash
npm run deploy
```

This runs `npm run build` then `gh-pages -d dist`, which pushes the built `dist/` folder to a `gh-pages` branch on your repo.

**Step 4: Enable GitHub Pages**

1. Go to your repo on GitHub → Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: `gh-pages`, folder: `/ (root)`
4. Save

**Step 5: Verify**

Visit: `https://YOUR_GITHUB_USERNAME.github.io/washboss/`
Expected: Full site loads, all images display, smooth scroll works, contact form works (after Formspree ID is set)

> Future deploys: just run `npm run deploy` from the project directory.