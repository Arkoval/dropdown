import type { Ref } from 'react'

export function assignRef<T>(ref: Ref<T> | undefined, node: T) {
  if (!ref) {
    return
  }
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  ref.current = node
}
