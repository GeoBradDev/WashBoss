import { Box } from '@mui/material'
import SkipLink from './components/SkipLink'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import About from './components/About'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { sectionScrollSx } from './navigation'

export default function App() {
  return (
    <>
      <SkipLink />
      <Navbar />
      {/* tabIndex -1 lets the skip link move focus here; no ring on the whole page. */}
      <Box component="main" id="main" tabIndex={-1} sx={{ outline: 'none', ...sectionScrollSx }}>
        <Hero />
        <TrustBar />
        <Services />
        <About />
        <Gallery />
        <Contact />
      </Box>
      <Footer />
    </>
  )
}
