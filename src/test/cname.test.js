import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// public/CNAME records the production custom domain. Pages ignores the file
// when deploying from Actions (the domain lives in the Pages settings), so this
// guards the recorded value against accidental edits.
const cnamePath = join(dirname(fileURLToPath(import.meta.url)), '../../public/CNAME')

describe('public/CNAME', () => {
  it('names the production custom domain', () => {
    expect(readFileSync(cnamePath, 'utf8').trim()).toBe('washbosspw.com')
  })
})
