import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from './useControllableState'

describe('useControllableState', () => {
  it('updates internal state in uncontrolled mode and calls onChange', () => {
    const onChange = vi.fn<(value: string) => void>()

    const { result } = renderHook(() =>
      useControllableState({
        defaultValue: 'alpha',
        onChange,
      }),
    )

    expect(result.current[0]).toBe('alpha')

    act(() => {
      result.current[1]('beta')
    })

    expect(result.current[0]).toBe('beta')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('beta')
  })

  it('does not mutate internal value in controlled mode and relies on parent value', () => {
    const onChange = vi.fn<(value: string) => void>()

    const { result, rerender } = renderHook(
      ({ value }) =>
        useControllableState({
          value,
          defaultValue: 'alpha',
          onChange,
        }),
      {
        initialProps: { value: 'alpha' },
      },
    )

    act(() => {
      result.current[1]('beta')
    })

    expect(onChange).toHaveBeenCalledWith('beta')
    expect(result.current[0]).toBe('alpha')

    rerender({ value: 'beta' })
    expect(result.current[0]).toBe('beta')
  })
})
