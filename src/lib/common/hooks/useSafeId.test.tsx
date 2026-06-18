import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSafeId } from './useSafeId'

describe('useSafeId', () => {
  it('returns a stable id without colon characters', () => {
    const { result, rerender } = renderHook(() => useSafeId())

    const firstId = result.current
    expect(firstId.length).toBeGreaterThan(0)
    expect(firstId.includes(':')).toBe(false)

    rerender()

    expect(result.current).toBe(firstId)
  })
})
