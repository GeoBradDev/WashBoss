import { useState } from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]


export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)

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
            component="img"
            src={`${import.meta.env.BASE_URL}SCSL.jpeg`}
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
  )
}