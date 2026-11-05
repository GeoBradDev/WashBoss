import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import { renderWithTheme } from './renderWithTheme'

// Issue #6: the 1.8 MB SCSL.jpeg was preloaded at high priority and shown at
// 220px or smaller. These tests pin the right-sized logo variants, the
// srcset/sizes on every logo img, the preload that matches the hero, and the
// social and structured data images.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
const publicDir = join(repoRoot, 'public')
const html = readFileSync(join(repoRoot, 'index.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')

const SITE = 'https://washbosspw.com'
const VARIANTS = [112, 168, 280, 320, 440, 660]
const BUDGET = 100 * 1024

function webpSize(buf) {
  expect(buf.subarray(0, 4).toString('latin1')).toBe('RIFF')
  expect(buf.subarray(8, 12).toString('latin1')).toBe('WEBP')
  const chunk = buf.subarray(12, 16).toString('latin1')
  if (chunk === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8X') {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 }
  }
  throw new Error(`unknown WebP chunk ${chunk}`)
}

// Walks JPEG markers to the frame header. Returns the size and whether the
// frame is baseline (SOF0) or progressive (SOF2).
function jpegInfo(buf) {
  expect(buf.readUInt16BE(0)).toBe(0xffd8)
  let i = 2
  while (i < buf.length) {
    if (buf[i] !== 0xff) throw new Error(`bad JPEG marker at ${i}`)
    const marker = buf[i + 1]
    const len = buf.readUInt16BE(i + 2)
    if (marker === 0xc0 || marker === 0xc2) {
      return {
        width: buf.readUInt16BE(i + 7),
        height: buf.readUInt16BE(i + 5),
        baseline: marker === 0xc0,
      }
    }
    i += 2 + len
  }
  throw new Error('no JPEG frame header')
}

function parseSrcset(str) {
  return str.split(',').map((part) => {
    const [url, descriptor] = part.trim().split(/\s+/)
    return { url, w: Number(descriptor.replace(/w$/, '')) }
  })
}

// The standard selection rule: the smallest candidate at least as wide as needed.
function pick(candidates, needed) {
  return [...candidates].sort((a, b) => a.w - b.w).find((c) => c.w >= needed)
}

function publicFile(url) {
  return join(publicDir, url.replace(/^\//, ''))
}

function logoImg(Component) {
  const { container } = renderWithTheme(<Component />)
  const imgs = [...container.querySelectorAll('img')].filter((img) => /logo-\d+\.webp|SCSL/.test(img.getAttribute('src')))
  expect(imgs).toHaveLength(1)
  const img = imgs[0]
  return {
    src: img.getAttribute('src'),
    srcset: img.getAttribute('srcset'),
    sizes: img.getAttribute('sizes'),
  }
}

const SLOTS = {
  navbar: { Component: Navbar, sizes: '56px' },
  footer: { Component: Footer, sizes: '80px' },
  hero: { Component: Hero, sizes: '(min-width: 900px) 220px, 160px' },
}

describe('logo variants', () => {
  it.each(VARIANTS)('public/logo-%i.webp is a square WebP of that size', (n) => {
    const file = join(publicDir, `logo-${n}.webp`)
    expect(existsSync(file)).toBe(true)
    expect(webpSize(readFileSync(file))).toEqual({ width: n, height: n })
  })
})

describe('logo img in each component', () => {
  it.each(Object.entries(SLOTS))('%s uses the logo srcset and its sizes', (name, { Component, sizes }) => {
    const { src, srcset, sizes: actualSizes } = logoImg(Component)
    expect(actualSizes).toBe(sizes)
    expect(srcset).not.toBeNull()
    expect(parseSrcset(srcset)).toEqual(VARIANTS.map((n) => ({ url: `/logo-${n}.webp`, w: n })))
    expect(VARIANTS.map((n) => `/logo-${n}.webp`)).toContain(src)
    expect(`${src} ${srcset}`).not.toMatch(/SCSL/)
  })

  it('no logo slot is upscaled at DPR 1, 1.75, 2 or 3', () => {
    const slotWidths = { navbar: [56], footer: [80], hero: [160, 220] }
    const missing = []
    for (const [name, widths] of Object.entries(slotWidths)) {
      const { srcset } = logoImg(SLOTS[name].Component)
      expect(srcset).not.toBeNull()
      const candidates = parseSrcset(srcset)
      for (const width of widths) {
        for (const dpr of [1, 1.75, 2, 3]) {
          if (!pick(candidates, width * dpr)) missing.push(`${name} ${width}px @${dpr}x`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it.each([
    { viewport: 375, dpr: 1.75 },
    { viewport: 375, dpr: 3 },
    { viewport: 1440, dpr: 1 },
    { viewport: 1440, dpr: 2 },
  ])('first load logo bytes are under 100 KB at $viewport px, DPR $dpr', ({ viewport, dpr }) => {
    const navbar = logoImg(Navbar)
    const hero = logoImg(Hero)
    expect(navbar.srcset).not.toBeNull()
    expect(hero.srcset).not.toBeNull()
    const heroWidth = viewport >= 900 ? 220 : 160
    const files = new Set([
      pick(parseSrcset(navbar.srcset), 56 * dpr).url,
      pick(parseSrcset(hero.srcset), heroWidth * dpr).url,
    ])
    const bytes = [...files].reduce((sum, url) => sum + statSync(publicFile(url)).size, 0)
    expect(bytes).toBeLessThan(BUDGET)
  })
})

describe('index.html logo references', () => {
  it('does not reference SCSL.jpeg', () => {
    expect(html).not.toMatch(/SCSL\.jpeg/)
  })

  it('preloads exactly the image the hero renders', () => {
    const preloads = doc.querySelectorAll('link[rel="preload"][as="image"]')
    expect(preloads).toHaveLength(1)
    const link = preloads[0]
    const hero = logoImg(Hero)
    expect(link.getAttribute('type')).toBe('image/webp')
    expect(link.getAttribute('fetchpriority')).toBe('high')
    expect(link.getAttribute('href')).toBe(hero.src)
    expect(link.getAttribute('imagesrcset')).toBe(hero.srcset)
    expect(link.getAttribute('imagesizes')).toBe(hero.sizes)
  })
})

describe('social and structured data images', () => {
  const meta = (attr, key) => doc.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content')

  it('og and twitter images point at a 1200x630 baseline JPEG under 150 KB', () => {
    expect(meta('property', 'og:image')).toBe(`${SITE}/og-image.jpg`)
    expect(meta('name', 'twitter:image')).toBe(`${SITE}/og-image.jpg`)
    expect(meta('property', 'og:image:width')).toBe('1200')
    expect(meta('property', 'og:image:height')).toBe('630')
    expect(meta('property', 'og:image:type')).toBe('image/jpeg')
    expect(meta('property', 'og:image:alt')).toMatch(/logo/i)
    expect(meta('name', 'twitter:image:alt')).toMatch(/logo/i)
    expect(meta('name', 'twitter:card')).toBe('summary_large_image')

    const file = join(publicDir, 'og-image.jpg')
    expect(existsSync(file)).toBe(true)
    expect(jpegInfo(readFileSync(file))).toEqual({ width: 1200, height: 630, baseline: true })
    expect(statSync(file).size).toBeLessThan(150 * 1024)
  })

  it('JSON-LD logo and image use the square logo-512.jpg', () => {
    const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)
    expect(data.logo).toBe(`${SITE}/logo-512.jpg`)
    expect(data.image).toBe(`${SITE}/logo-512.jpg`)

    const file = join(publicDir, 'logo-512.jpg')
    expect(existsSync(file)).toBe(true)
    const { width, height } = jpegInfo(readFileSync(file))
    expect({ width, height }).toEqual({ width: 512, height: 512 })
  })
})
