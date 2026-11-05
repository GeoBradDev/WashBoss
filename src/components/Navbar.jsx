import { useRef, useState } from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { logoSrc, logoSrcSet, NAVBAR_LOGO_SIZES } from '../logo'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]


export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef(null)

  const handleNavClick = (href) => {
    setDrawerOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(8px)', boxShadow: 'none', borderBottom: '1px solid #222' }}
    >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Box
            component="a"
            href="#hero"
            aria-label="Wash Boss Pressure Washing, back to top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            sx={{
              display: 'block',
              borderRadius: '50%',
              '&:focus-visible': {
                outline: '3px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Box
              component="img"
              src={logoSrc(112)}
              srcSet={logoSrcSet}
              sizes={NAVBAR_LOGO_SIZES}
              alt=""
              sx={{ height: 56, width: 56, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
            />
          </Box>

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
            ref={menuButtonRef}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav-drawer"
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'primary.main' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* Mobile drawer */}
        {/* Drawer closes after its slide transition, and the page keeps
            aria-hidden until then. Modal's default focus restore runs as soon
            as it starts closing, which puts focus inside aria-hidden content,
            so focus returns to the menu button once the transition has exited. */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          ModalProps={{ disableRestoreFocus: true }}
          slotProps={{
            paper: { id: 'mobile-nav-drawer', 'aria-label': 'Navigation menu', sx: { backgroundColor: 'background.default', width: 240 } },
            transition: { onExited: () => menuButtonRef.current?.focus() },
          }}
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
  )
}