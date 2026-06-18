import { isValidElement } from 'react'
import type { ReactNode } from 'react'
import type { Position } from '../../common/utils/positioning'

export function extractNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(extractNodeText).join(' ')
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractNodeText(node.props.children)
  }

  return ''
}

export function arePositionsEqual(previous: Position | null, next: Position) {
  if (!previous) {
    return false
  }

  return (
    previous.top === next.top &&
    previous.left === next.left &&
    previous.right === next.right &&
    previous.dir === next.dir &&
    previous.transformOrigin === next.transformOrigin
  )
}