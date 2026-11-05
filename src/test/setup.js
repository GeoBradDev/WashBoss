import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// jsdom does not implement these browser APIs.
Element.prototype.scrollIntoView = vi.fn()
window.scrollTo = vi.fn()
