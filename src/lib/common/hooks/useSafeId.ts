import { useId } from 'react'

/**
 * Generate a unique, DOM-safe ID by removing colons from React's useId output.
 * Useful for generating IDs for aria-* attributes and CSS selectors.
 */
export function useSafeId(): string {
  const id = useId()
  return id.replace(/:/g, '')
}
