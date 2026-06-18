type SelectableItem = {
  value: string
  disabled: boolean
}

export type Position = {
  top: number
  left?: number
  right?: number
  dir: 'ltr' | 'rtl'
  transformOrigin: string
}

function resolveAlignedLeft(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  options: {
    align: 'start' | 'center' | 'end'
    alignOffset: number
    scrollX: number
    dir: 'ltr' | 'rtl'
  },
) {
  const { align, alignOffset, scrollX, dir } = options

  if (align === 'center') {
    return (
      triggerRect.left +
      scrollX +
      triggerRect.width / 2 -
      contentRect.width / 2 +
      alignOffset
    )
  }

  if (dir === 'rtl') {
    if (align === 'start') {
      return triggerRect.right + scrollX - contentRect.width + alignOffset
    }

    return triggerRect.left + scrollX - alignOffset
  }

  if (align === 'end') {
    return triggerRect.right + scrollX - contentRect.width - alignOffset
  }

  return triggerRect.left + scrollX + alignOffset
}

function toViewportRight(left: number, contentWidth: number, scrollX: number, viewportWidth: number) {
  const viewportLeft = left - scrollX
  return viewportWidth - viewportLeft - contentWidth
}

export function findInitialActiveValue(
  items: SelectableItem[],
  selectedValue: string | null,
) {
  const enabledItems = items.filter((item) => !item.disabled)
  if (enabledItems.length === 0) {
    return null
  }

  const selectedEnabledItem = enabledItems.find(
    (item) => item.value === selectedValue,
  )

  return selectedEnabledItem?.value ?? enabledItems[0].value
}

export function computePosition(
  triggerRect: DOMRect,
  contentRect: DOMRect,
  options: {
    side: 'top' | 'bottom'
    align: 'start' | 'center' | 'end'
    sideOffset: number
    alignOffset: number
    avoidCollisions: boolean
    dir?: 'ltr' | 'rtl'
  },
): Position {
  const { side, align, sideOffset, alignOffset, avoidCollisions, dir = 'ltr' } = options
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let preferredSide = side

  if (avoidCollisions) {
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top

    if (side === 'bottom' && spaceBelow < contentRect.height && spaceAbove > spaceBelow) {
      preferredSide = 'top'
    }

    if (side === 'top' && spaceAbove < contentRect.height && spaceBelow > spaceAbove) {
      preferredSide = 'bottom'
    }
  }

  const top =
    preferredSide === 'bottom'
      ? triggerRect.bottom + sideOffset
      : triggerRect.top - contentRect.height - sideOffset

  let left = resolveAlignedLeft(triggerRect, contentRect, {
    align,
    alignOffset,
    scrollX: 0,
    dir,
  })

  // In RTL, we need to compute right position instead of left
  // For fixed positioning, right is relative to viewport, not document
  let right: number | undefined
  if (dir === 'rtl') {
    right = toViewportRight(left, contentRect.width, 0, viewportWidth)
  }

  if (avoidCollisions) {
    const rightEdge = left + contentRect.width

    if (rightEdge > viewportWidth) {
      left = viewportWidth - contentRect.width - 8
      if (dir === 'rtl') {
        right = toViewportRight(left, contentRect.width, 0, viewportWidth)
      }
    }

    if (left < 8) {
      left = 8
      if (dir === 'rtl') {
        right = toViewportRight(left, contentRect.width, 0, viewportWidth)
      }
    }
  }

  return {
    top,
    left: dir === 'ltr' ? left : undefined,
    right,
    dir,
    transformOrigin: preferredSide === 'bottom' ? 'top' : 'bottom',
  }
}
