import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithTheme } from '../test/renderWithTheme'
import Hero from './Hero'

let section = null

function addContactSection() {
  section = document.createElement('section')
  section.id = 'contact'
  section.scrollIntoView = vi.fn()
  const h2 = document.createElement('h2')
  h2.tabIndex = -1
  h2.textContent = 'Get in Touch'
  section.appendChild(h2)
  document.body.appendChild(section)
  return section
}

afterEach(() => {
  section?.remove()
  section = null
  window.history.replaceState(null, '', '/')
})

describe('Hero Get Free Estimate', () => {
  it('is a link to #contact that scrolls, sets the hash, and focuses the Contact h2', () => {
    const contact = addContactSection()
    renderWithTheme(<Hero />)

    const link = screen.getByRole('link', { name: 'Get Free Estimate' })
    expect(link).toHaveAttribute('href', '#contact')
    const notPrevented = fireEvent.click(link)

    expect(notPrevented).toBe(false)
    expect(contact.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(window.location.hash).toBe('#contact')
    expect(contact.querySelector('h2')).toHaveFocus()
  })

  it('leaves a Ctrl click to the browser', () => {
    const contact = addContactSection()
    renderWithTheme(<Hero />)

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Get Free Estimate' }), { ctrlKey: true })

    expect(notPrevented).toBe(true)
    expect(contact.scrollIntoView).not.toHaveBeenCalled()
  })

  it('renders the subtitle as a paragraph, not a heading', () => {
    renderWithTheme(<Hero />)

    expect(screen.getAllByRole('heading').map((h) => h.tagName)).toEqual(['H1'])
  })
})
