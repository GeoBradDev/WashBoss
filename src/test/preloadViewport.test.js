import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A responsive image preload is evaluated when the parser reaches it. If the
// viewport meta comes later, a mobile browser resolves imagesizes against the
// default 980px layout viewport, takes the 220px branch, fetches a larger
// logo than the hero needs, and every logo img then reuses that file (seen in
// the issue #6 live drive: logo-440.webp at 375px DPR 1.75 instead of 280).
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')
const html = readFileSync(join(repoRoot, 'index.html'), 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')

describe('index.html head order', () => {
  it('declares the viewport before any responsive image preload', () => {
    const head = [...doc.head.children]
    const viewport = head.findIndex((el) => el.matches('meta[name="viewport"]'))
    const preload = head.findIndex((el) => el.matches('link[rel="preload"][imagesrcset]'))
    expect(viewport).toBeGreaterThanOrEqual(0)
    expect(preload).toBeGreaterThanOrEqual(0)
    expect(viewport).toBeLessThan(preload)
  })
})
