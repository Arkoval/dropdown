let bodyScrollLockCount = 0
let bodyOverflowBeforeLock: string | null = null

export function lockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    bodyOverflowBeforeLock = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  bodyScrollLockCount += 1
}

export function unlockBodyScroll() {
  if (bodyScrollLockCount === 0) {
    return
  }

  bodyScrollLockCount -= 1
  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = bodyOverflowBeforeLock ?? ''
    bodyOverflowBeforeLock = null
  }
}
