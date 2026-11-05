import { useRef, useState } from 'react'
import {
  AppBar, Toolbar, Box, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { logoSrc, logoSrcSet, NAVBAR_LOGO_SIZES } from '../logo'
import {
  focusSectionHeading, isPlainLeftClick, navigateToSection, scrollToSection, setHash,
} from '../navigation'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]


export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const desktopNavRef = useRef(null)
  // The section chosen in the drawer, focused once the drawer has exited.
  const pendingTargetRef = useRef(null)
  // At md and up the hamburger is hidden and the desktop nav shows.
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true })
  const [wasDesktop, setWasDesktop] = useState(isDesktop)

  // Widening to md with the drawer open: close it, adjusting state during
  // render rather than in an effect. Focus goes to the first desktop link in
  // onExited, since the hamburger is no longer shown.
  if (isDesktop !== wasDesktop) {
    setWasDesktop(isDesktop)
    if (isDesktop) setDrawerOpen(false)
  }

  const openDrawer = () => {
    pendingTargetRef.current = null
    setDrawerOpen(true)
  }

  // Desktop links are real anchors. A plain left click (or Enter) is taken
  // over; modified and middle clicks open the link as the browser would.
  const handleDesktopNavClick = (event, href) => {
    if (!isPlainLeftClick(event)) return
    event.preventDefault()
    navigateToSection(href)
  }

  // The page is aria-hidden while the drawer is open, so focus moves only
  // after the exit transition (see onExited below).
  const handleDrawerNavClick = (href) => {
    pendingTargetRef.current = href
    setDrawerOpen(false)
    scrollToSection(href)
    setHash(href)
  }

  const handleDrawerExited = () => {
    const target = pendingTargetRef.current
    pendingTargetRef.current = null
    if (target && focusSectionHeading(target)) return
    if (isDesktop) {
      desktopNavRef.current?.querySelector('a')?.focus()
    } else {
      menuButtonRef.current?.focus()
    }
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

          {/* One Primary navigation at every width: the desktop links at md
              and up, the hamburger below md. The logo link stays outside it. */}
          <Box component="nav" aria-label="Primary" sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Desktop links */}
            <Box
              ref={desktopNavRef}
              // Shown by the md breakpoint, and also whenever the md media query
              // matches, so it is never hidden while it is the focus fallback.
              sx={{ display: isDesktop ? 'flex' : { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}
            >
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.label}
                  component="a"
                  href={link.href}
                  onClick={(e) => handleDesktopNavClick(e, link.href)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  {link.label}
                </Button>
              ))}
              <Button
                variant="contained"
                color="primary"
                component="a"
                href="#contact"
                onClick={(e) => handleDesktopNavClick(e, '#contact')}
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
              onClick={openDrawer}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Mobile drawer */}
        {/* Drawer closes after its slide transition, and the page keeps
            aria-hidden until then. Modal's default focus restore runs as soon
            as it starts closing, which puts focus inside aria-hidden content,
            so focus moves once the transition has exited: to the chosen
            section's heading, else the menu button, else (at md and up, where
            the menu button is hidden) the first desktop nav link. */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          ModalProps={{ disableRestoreFocus: true }}
          slotProps={{
            paper: { id: 'mobile-nav-drawer', 'aria-label': 'Navigation menu', sx: { backgroundColor: 'background.default', width: 240 } },
            transition: { onExited: handleDrawerExited },
          }}
        >
          {/* The page behind is aria-hidden while the drawer is open, so this is
              the only Primary navigation exposed at that time. */}
          <Box component="nav" aria-label="Primary">
            <List sx={{ pt: 4 }}>
              {NAV_LINKS.map((link) => (
                <ListItem key={link.label} disablePadding>
                  <ListItemButton onClick={() => handleDrawerNavClick(link.href)}>
                    <ListItemText primary={link.label} sx={{ color: 'text.primary' }} />
                  </ListItemButton>
                </ListItem>
              ))}
              <ListItem sx={{ pt: 2 }}>
                <Button
                  fullWidth variant="contained" color="primary"
                  onClick={() => handleDrawerNavClick('#contact')}
                >
                  Get a Free Quote
                </Button>
              </ListItem>
            </List>
          </Box>
        </Drawer>
    </AppBar>
  )
}