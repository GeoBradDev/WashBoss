import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// public/CNAME is copied into dist/ by Vite, so the deployed site carries
// the production custom domain.
const cnamePath = join(dirname(fileURLToPath(import.meta.url)), '../../public/CNAME')

describe('public/CNAME', () => {
  it('names the production custom domain', () => {
    expect(readFileSync(cnamePath, 'utf8').trim()).toBe('washbosspw.com')
  })
})
