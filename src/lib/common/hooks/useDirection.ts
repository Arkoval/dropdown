import { useSyncExternalStore } from 'react'
import type { Direction } from '../types'

function subscribeToDirection(onStoreChange: () => void) {
  const observer = new MutationObserver(() => {
    onStoreChange()
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dir'],
  })

  return () => {
    observer.disconnect()
  }
}

function getDirectionSnapshot(): Direction {
  const dir = document.documentElement.dir
  return dir === 'rtl' ? 'rtl' : 'ltr'
}

export function useDirection(): Direction {
  return useSyncExternalStore(subscribeToDirection, getDirectionSnapshot, () => 'ltr')
}
