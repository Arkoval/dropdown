import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { assignRef } from './ref'

describe('assignRef', () => {
  it('assigns node to object refs', () => {
    const ref = createRef<HTMLDivElement>()
    const node = document.createElement('div')

    assignRef(ref, node)

    expect(ref.current).toBe(node)
  })

  it('calls callback refs with node', () => {
    const callbackRef = vi.fn<(node: HTMLDivElement) => void>()
    const node = document.createElement('div')

    assignRef(callbackRef, node)

    expect(callbackRef).toHaveBeenCalledTimes(1)
    expect(callbackRef).toHaveBeenCalledWith(node)
  })
})
