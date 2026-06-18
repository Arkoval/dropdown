import { useContext, useMemo } from 'react'
import { DropdownContext } from './Dropdown'
import type { DropdownItemRecord } from './types'

/**
 * Hook to access selected value and item data.
 * Use this for full control over value rendering.
 * 
 * @example
 * ```tsx
 * function CustomValue({ placeholder }) {
 *   const { selectedItem } = useDropdownValue()
 *   return <span>{selectedItem ? selectedItem.content : placeholder}</span>
 * }
 * ```
 */
export function useDropdownValue() {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('useDropdownValue must be used within <Dropdown.Root>.')
  }

  const itemByValue = useMemo(() => {
    const map = new Map<string, DropdownItemRecord>()
    context.items.forEach((item) => {
      map.set(item.value, item)
    })
    return map
  }, [context.items])

  const selectedItem = context.selectedValue
    ? itemByValue.get(context.selectedValue)
    : undefined

  return {
    value: context.selectedValue,
    disabled: context.disabled,
    error: context.error,
    selectedItem: selectedItem
      ? {
          value: selectedItem.value,
          content: selectedItem.optionContent,
          valueContent: selectedItem.valueContent,
          textValue: selectedItem.textValue,
        }
      : null,
    items: context.items,
  }
}
