type TypeaheadItem = {
  value: string
  disabled: boolean
  textValue?: string
}

export function matchTypeahead(
  items: TypeaheadItem[],
  currentActive: string | null,
  searchTerm: string,
): string | null {
  const enabledItems = items.filter((item) => !item.disabled)
  if (enabledItems.length === 0) {
    return null
  }

  const rawQuery = searchTerm.toLowerCase().trim()
  if (!rawQuery) {
    return null
  }

  // Repeated presses of the same key should cycle through matching items.
  const query =
    rawQuery.length > 1 && rawQuery.split('').every((char) => char === rawQuery[0])
      ? rawQuery[0]
      : rawQuery

  const currentIndex = enabledItems.findIndex((item) => item.value === currentActive)

  const textOf = (item: TypeaheadItem) => (item.textValue ?? item.value).toLowerCase()

  for (let index = currentIndex + 1; index < enabledItems.length; index += 1) {
    if (textOf(enabledItems[index]).startsWith(query)) {
      return enabledItems[index].value
    }
  }

  for (let index = 0; index <= currentIndex; index += 1) {
    if (textOf(enabledItems[index]).startsWith(query)) {
      return enabledItems[index].value
    }
  }

  return null
}
