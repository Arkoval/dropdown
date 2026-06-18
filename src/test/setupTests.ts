import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
  document.documentElement.dir = ''
})

class ResizeObserverMock {
  observe() {
    // no-op in jsdom
  }

  unobserve() {
    // no-op in jsdom
  }

  disconnect() {
    // no-op in jsdom
  }
}

if (!('ResizeObserver' in globalThis)) {
  // Vitest jsdom may not provide this API.
  globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver
}
