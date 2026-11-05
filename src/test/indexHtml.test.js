import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// index.html ships the favicon links and the LocalBusiness JSON-LD that search
// engines read. This guards against links to files that do not exist (the old
// /vite.svg 404) and against invalid structured data values.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
const publicDir = join(repoRoot, 'public')
const html = readFileSync(join(repoRoot, 'index.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')

const SITE = 'https://washbosspw.com'

function parseJsonLd() {
  const script = doc.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  return JSON.parse(script.textContent)
}

function collectStrings(value, out = []) {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out))
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectStrings(v, out))
  return out
}

// Resolve a URL path against baseDir. Returns null when the path escapes
// baseDir, names baseDir itself, or is not a regular file.
function resolveLocal(urlPath, baseDir) {
  let clean
  try {
    clean = decodeURIComponent(urlPath.split(/[?#]/)[0])
  } catch {
    return null
  }
  const file = join(baseDir, clean)
  const rel = relative(baseDir, file)
  if (rel === '' || rel.startsWith('..') || isAbsolute(rel)) return null
  if (!existsSync(file) || !statSync(file).isFile()) return null
  return file
}

function pngSize(path) {
  const buf = readFileSync(path)
  expect(buf.subarray(1, 4).toString('latin1')).toBe('PNG')
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function icoFirstSize(path) {
  const buf = readFileSync(path)
  expect(buf.readUInt16LE(2)).toBe(1)
  const width = buf[6] === 0 ? 256 : buf[6]
  const height = buf[7] === 0 ? 256 : buf[7]
  return { width, height }
}

describe('index.html', () => {
  it('does not reference vite.svg', () => {
    expect(html).not.toMatch(/vite\.svg/)
  })

  it('links the favicon, the 192px icon and the apple touch icon', () => {
    const links = [...doc.querySelectorAll('link')].map((l) => ({
      rel: l.getAttribute('rel'),
      href: l.getAttribute('href'),
      type: l.getAttribute('type'),
      sizes: l.getAttribute('sizes'),
    }))
    expect(links).toContainEqual(expect.objectContaining({ rel: 'icon', href: '/favicon.ico', sizes: '32x32' }))
    expect(links).toContainEqual(
      expect.objectContaining({ rel: 'icon', href: '/icon-192.png', type: 'image/png', sizes: '192x192' }),
    )
    expect(links).toContainEqual(expect.objectContaining({ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }))
  })

  it('only references local assets that exist', () => {
    const missing = []
    for (const el of doc.querySelectorAll('[href], [src], [content]')) {
      for (const attr of ['href', 'src', 'content']) {
        const value = el.getAttribute(attr)
        if (value && value.startsWith('/') && !value.startsWith('//')) {
          // Only a module script under /src/ comes from the source tree (Vite bundles it);
          // everything else, including absolute site URLs below, must be a file in public/.
          const isModuleEntry = attr === 'src' && el.matches('script[type="module"]') && value.startsWith('/src/')
          if (!resolveLocal(value, isModuleEntry ? repoRoot : publicDir)) missing.push(value)
        }
      }
    }
    const absolute = []
    for (const el of doc.querySelectorAll('*')) {
      for (const { value } of el.attributes) absolute.push(value)
    }
    absolute.push(...collectStrings(parseJsonLd()))
    for (const value of absolute) {
      if (!value.startsWith(`${SITE}/`)) continue
      const path = value.slice(SITE.length)
      if (path === '/') continue
      if (!resolveLocal(path, publicDir)) missing.push(value)
    }
    expect(missing).toEqual([])
  })

  it('ships icon files with the declared dimensions', () => {
    expect(icoFirstSize(join(publicDir, 'favicon.ico'))).toEqual({ width: 32, height: 32 })
    expect(pngSize(join(publicDir, 'icon-192.png'))).toEqual({ width: 192, height: 192 })
    expect(pngSize(join(publicDir, 'apple-touch-icon.png'))).toEqual({ width: 180, height: 180 })
  })
})

describe('index.html LocalBusiness JSON-LD', () => {
  it('is a LocalBusiness without email, sameAs or geo', () => {
    const data = parseJsonLd()
    expect(data['@type']).toBe('LocalBusiness')
    expect(data).not.toHaveProperty('email')
    expect(data).not.toHaveProperty('sameAs')
    expect(data).not.toHaveProperty('geo')
  })

  it('serves St. Louis City, St. Louis County and St. Charles County in Missouri', () => {
    const area = (name) => ({
      '@type': 'AdministrativeArea',
      name,
      containedInPlace: { '@type': 'State', name: 'Missouri' },
    })
    expect(parseJsonLd().areaServed).toEqual([
      area('St. Louis City'),
      area('St. Louis County'),
      area('St. Charles County'),
    ])
  })
})
