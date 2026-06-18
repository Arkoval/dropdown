import { beforeEach, describe, expect, it } from 'vitest'
import { computePosition, findInitialActiveValue } from './positioning'

function rect(input: {
  left: number
  top: number
  width: number
  height: number
}): DOMRect {
  const right = input.left + input.width
  const bottom = input.top + input.height

  return {
    x: input.left,
    y: input.top,
    left: input.left,
    top: input.top,
    width: input.width,
    height: input.height,
    right,
    bottom,
    toJSON: () => ({}),
  } as DOMRect
}

describe('findInitialActiveValue', () => {
  it('returns selected value when it is enabled', () => {
    const value = findInitialActiveValue(
      [
        { value: 'alpha', disabled: false },
        { value: 'beta', disabled: false },
      ],
      'beta',
    )

    expect(value).toBe('beta')
  })

  it('falls back to first enabled option or null', () => {
    expect(
      findInitialActiveValue(
        [
          { value: 'alpha', disabled: true },
          { value: 'beta', disabled: false },
        ],
        'alpha',
      ),
    ).toBe('beta')

    expect(
      findInitialActiveValue(
        [
          { value: 'alpha', disabled: true },
          { value: 'beta', disabled: true },
        ],
        null,
      ),
    ).toBeNull()
  })
})

describe('computePosition', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true })
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('flips from bottom to top when there is not enough space below', () => {
    const triggerRect = rect({ left: 100, top: 560, width: 120, height: 30 })
    const contentRect = rect({ left: 0, top: 0, width: 180, height: 120 })

    const result = computePosition(triggerRect, contentRect, {
      side: 'bottom',
      align: 'start',
      sideOffset: 4,
      alignOffset: 0,
      avoidCollisions: true,
      dir: 'ltr',
    })

    expect(result.transformOrigin).toBe('bottom')
    expect(result.top).toBe(436)
    expect(result.left).toBe(100)
  })

  it('returns right-aligned coordinates for rtl direction', () => {
    const triggerRect = rect({ left: 600, top: 200, width: 120, height: 32 })
    const contentRect = rect({ left: 0, top: 0, width: 200, height: 100 })

    const result = computePosition(triggerRect, contentRect, {
      side: 'bottom',
      align: 'start',
      sideOffset: 8,
      alignOffset: 0,
      avoidCollisions: false,
      dir: 'rtl',
    })

    expect(result.dir).toBe('rtl')
    expect(result.left).toBeUndefined()
    expect(typeof result.right).toBe('number')
    expect(result.right).toBe(80)
  })
})
