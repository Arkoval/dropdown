import { beforeEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  document.body.style.overflow = ''
})

describe('bodyScrollLock', () => {
  it('preserves and restores previous body overflow value', async () => {
    const { lockBodyScroll, unlockBodyScroll } = await import('./bodyScrollLock')

    document.body.style.overflow = 'auto'

    lockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('requires matching unlock count before restoring overflow', async () => {
    const { lockBodyScroll, unlockBodyScroll } = await import('./bodyScrollLock')

    document.body.style.overflow = 'clip'

    lockBodyScroll()
    lockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('clip')
  })
})
