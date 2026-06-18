import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDirection } from './useDirection'

describe('useDirection', () => {
  it('returns ltr when dir is not set to rtl', () => {
    document.documentElement.dir = ''

    const { result } = renderHook(() => useDirection())

    expect(result.current).toBe('ltr')
  })

  it('reacts to dir attribute changes', async () => {
    document.documentElement.dir = 'ltr'

    const { result } = renderHook(() => useDirection())
    expect(result.current).toBe('ltr')

    document.documentElement.setAttribute('dir', 'rtl')

    await waitFor(() => {
      expect(result.current).toBe('rtl')
    })

    document.documentElement.setAttribute('dir', 'invalid-value')

    await waitFor(() => {
      expect(result.current).toBe('ltr')
    })
  })
})
