import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { Slot } from '@radix-ui/react-slot'
import { AccessibleIcon } from '@/lib/primitives/icon'
import { ReactComponent as ChevronDownIcon } from '@/assets/chevron-down.svg'
import { ReactComponent as CheckIcon } from '@/assets/check.svg'
import { useControllableState } from '../../common/hooks/useControllableState'
import { useSafeId } from '../../common/hooks/useSafeId'
import { useDirection } from '../../common/hooks/useDirection'
import {
  assignRef,
  mergeClassNames,
  findInitialActiveValue,
  computePosition,
  matchTypeahead,
  lockBodyScroll,
  unlockBodyScroll,
} from '../../common/utils'
import type { Position } from '../../common/utils/positioning'
import type {
  DropdownItemRecord,
  DropdownContextValue,
  DropdownRootProps,
  DropdownTriggerProps,
  DropdownContentProps,
  DropdownItemProps,
  DropdownPortalProps,
  DropdownPortalStyle,
} from './types'
import { arePositionsEqual, extractNodeText } from './utils'
import styles from './Dropdown.module.css'

// eslint-disable-next-line react-refresh/only-export-components
export const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdownContext(componentName: string) {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error(`${componentName} must be used within <Dropdown.Root>.`)
  }
  return context
}

function DropdownRoot({
  id,
  disabled = false,
  error = false,
  labelledBy,
  describedBy,
  value,
  defaultValue = null,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: DropdownRootProps) {
  const dir = useDirection()
  const generatedId = useSafeId()
  const baseId = id ?? `dropdown-${generatedId}`

  const [selectedValue, setSelectedValue] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  })

  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const [activeValue, setActiveValue] = useState<string | null>(null)
  const [itemState, setItemState] = useState<{
    items: DropdownItemRecord[]
    indexByValue: Record<string, number>
  }>({
    items: [],
    indexByValue: {},
  })

  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const setTriggerNode = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node
  }, [])

  const setListNode = useCallback((node: HTMLUListElement | null) => {
    listRef.current = node
  }, [])

  const setContentNode = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node
  }, [])

  const registerItem = useCallback((item: DropdownItemRecord) => {
    setItemState((currentState) => {
      const itemIndex = currentState.indexByValue[item.value]

      if (itemIndex === undefined) {
        return {
          items: [...currentState.items, item],
          indexByValue: {
            ...currentState.indexByValue,
            [item.value]: currentState.items.length,
          },
        }
      }

      const existingItem = currentState.items[itemIndex]
      const hasMeaningfulChange =
        existingItem.optionId !== item.optionId ||
        existingItem.disabled !== item.disabled ||
        existingItem.optionContent !== item.optionContent ||
        existingItem.valueContent !== item.valueContent ||
        existingItem.textValue !== item.textValue

      if (!hasMeaningfulChange) {
        return currentState
      }

      const nextItems = currentState.items.slice()
      nextItems[itemIndex] = item

      return {
        items: nextItems,
        indexByValue: currentState.indexByValue,
      }
    })
  }, [])

  const unregisterItem = useCallback((valueToRemove: string) => {
    setItemState((currentState) => {
      const itemIndex = currentState.indexByValue[valueToRemove]
      if (itemIndex === undefined) {
        return currentState
      }

      const nextItems = currentState.items.slice()
      nextItems.splice(itemIndex, 1)

      const nextIndexByValue = { ...currentState.indexByValue }
      delete nextIndexByValue[valueToRemove]

      for (let index = itemIndex; index < nextItems.length; index += 1) {
        nextIndexByValue[nextItems[index].value] = index
      }

      return {
        items: nextItems,
        indexByValue: nextIndexByValue,
      }
    })
  }, [])

  const items = itemState.items

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setActiveValue(findInitialActiveValue(items, selectedValue))
      }
      setIsOpen(nextOpen)
    },
    [items, selectedValue, setIsOpen],
  )

  useEffect(() => {
    if (disabled && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleOpenChange(false)
    }
  }, [disabled, handleOpenChange, isOpen])

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll()

      return () => {
        unlockBodyScroll()
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (rootRef.current?.contains(target)) {
        return
      }

      if (contentRef.current?.contains(target)) {
        return
      }

      handleOpenChange(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [handleOpenChange, isOpen])

  useEffect(() => {
    if (import.meta.env.PROD) {
      return
    }

    if (!triggerRef.current) {
      console.warn(
        'Dropdown.Root should contain a <Dropdown.Trigger> child to provide an interactive trigger element.',
      )
    }

    if (!listRef.current) {
      console.warn(
        'Dropdown.Root should contain a <Dropdown.Content> child to provide the listbox content.',
      )
    }
  }, [])

  const contextValue = useMemo<DropdownContextValue>(
    () => ({
      dir,
      disabled,
      error,
      open: isOpen,
      setOpen: handleOpenChange,
      selectedValue,
      setSelectedValue,
      activeValue,
      setActiveValue,
      triggerId: `${baseId}-trigger`,
      listboxId: `${baseId}-listbox`,
      labelledBy,
      describedBy,
      triggerRef,
      listRef,
      rootRef,
      contentRef,
      setTriggerNode,
      setListNode,
      setContentNode,
      items,
      registerItem,
      unregisterItem,
    }),
    [
      activeValue,
      baseId,
      describedBy,
      dir,
      disabled,
      error,
      handleOpenChange,
      isOpen,
      items,
      labelledBy,
      registerItem,
      selectedValue,
      setContentNode,
      setListNode,
      setSelectedValue,
      setTriggerNode,
      unregisterItem,
    ],
  )

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={rootRef}
        className={mergeClassNames(styles.root, className)}
        data-disabled={disabled}
        data-open={isOpen}
        dir={dir}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  function DropdownTrigger(
    { asChild = false, className, onClick, onKeyDown, disabled, ...props },
    forwardedRef,
  ) {
    const context = useDropdownContext('Dropdown.Trigger')

    const isDisabled = context.disabled || disabled

    const triggerClassName = mergeClassNames(
      styles.trigger,
      isDisabled ? styles.triggerDisabled : undefined,
      className,
    )

    const handleClick: DropdownTriggerProps['onClick'] = (event) => {
      onClick?.(event)
      if (event.defaultPrevented || isDisabled) {
        return
      }
      context.setOpen(!context.open)
    }

    const handleKeyDown: DropdownTriggerProps['onKeyDown'] = (event) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || isDisabled) {
        return
      }

      if (
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp' ||
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault()
        context.setOpen(true)
      }
    }

    const handleRef = (node: HTMLElement | null) => {
      context.setTriggerNode(node)
      assignRef(forwardedRef, node as HTMLButtonElement)
    }

    const baseProps = {
      id: context.triggerId,
      className: triggerClassName,
      'aria-haspopup': 'listbox' as const,
      'aria-expanded': context.open,
      'aria-controls': context.listboxId,
      'aria-labelledby': context.labelledBy,
      'aria-describedby': context.describedBy,
      'aria-disabled': isDisabled,
      'aria-invalid': context.error || undefined,
      'data-state': context.open ? 'open' : 'closed',
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      ref: handleRef,
      ...props,
    }

    if (asChild) {
      return <Slot {...baseProps} />
    }

    return <button type="button" {...baseProps} disabled={isDisabled} />
  },
)

function DropdownChevron({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <AccessibleIcon className={mergeClassNames(styles.chevron, className)}>
      <ChevronDownIcon {...props} />
    </AccessibleIcon>
  )
}

function DropdownPortal({ position, children }: DropdownPortalProps) {
  const context = useDropdownContext('DropdownPortal')
  const hasValidPosition = Boolean(position && position.dir === context.dir)

  const triggerWidth =
    context.open && context.triggerRef.current
      ? context.triggerRef.current.getBoundingClientRect().width
      : null

  const contentStyle: DropdownPortalStyle = {
    ...(hasValidPosition && position
      ? {
          position: 'fixed',
          top: `${position.top}px`,
          ...(position.right !== undefined
            ? { right: `${position.right}px` }
            : { left: `${position.left}px` }
          ),
          transformOrigin: position.transformOrigin,
        }
      : {
          position: 'fixed',
          top: '-10000px',
          left: '-10000px',
        }),
    '--dropdown-trigger-width': triggerWidth ? `${triggerWidth}px` : undefined,
    display: context.open ? undefined : 'none',
  }

  const content = <div style={contentStyle}>{children}</div>

  return createPortal(content, document.body)
}

function DropdownContent({
  maxHeight = 232,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  avoidCollisions = true,
  className,
  style,
  children,
  ...props
}: DropdownContentProps) {
  const context = useDropdownContext('Dropdown.Content')
  const [position, setPosition] = useState<Position | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const searchTimeoutRef = useRef<number | null>(null)
  const positionFrameRef = useRef<number | null>(null)

  const enabledItems = useMemo(
    () => context.items.filter((item) => !item.disabled),
    [context.items],
  )

  const itemByValue = useMemo(() => {
    const map = new Map<string, DropdownItemRecord>()
    context.items.forEach((item) => {
      map.set(item.value, item)
    })
    return map
  }, [context.items])

  const optionIdByValue = useMemo(() => {
    const map = new Map<string, string>()
    context.items.forEach((item) => {
      map.set(item.value, item.optionId)
    })
    return map
  }, [context.items])

  const scrollOptionIntoView = useCallback((value: string | null) => {
    if (!value) {
      return
    }

    const optionId = optionIdByValue.get(value)
    if (!optionId) {
      return
    }

    const optionElement = document.getElementById(optionId)
    optionElement?.scrollIntoView({ block: 'nearest' })
  }, [optionIdByValue])

  // Update position when dropdown opens or on viewport changes.
  useEffect(() => {
    if (!context.open || !context.triggerRef.current || !context.contentRef.current) {
      return
    }

    const updatePosition = () => {
      if (!context.triggerRef.current || !context.contentRef.current) {
        return
      }

      const triggerRect = context.triggerRef.current.getBoundingClientRect()
      const contentRect = context.contentRef.current.getBoundingClientRect()

      const pos = computePosition(triggerRect, contentRect, {
        side,
        align,
        sideOffset,
        alignOffset,
        avoidCollisions,
        dir: context.dir,
      })

      setPosition((previous) => (arePositionsEqual(previous, pos) ? previous : pos))
    }

    const schedulePositionUpdate = () => {
      if (positionFrameRef.current !== null) {
        return
      }

      positionFrameRef.current = window.requestAnimationFrame(() => {
        positionFrameRef.current = null
        updatePosition()
      })
    }

    schedulePositionUpdate()

    // Do not subscribe with capture=true to avoid reacting to list internal scroll.
    const onViewportChange = () => {
      schedulePositionUpdate()
    }

    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, { passive: true })

    const resizeObserver = new ResizeObserver(() => {
      schedulePositionUpdate()
    })

    resizeObserver.observe(context.triggerRef.current)
    resizeObserver.observe(context.contentRef.current)

    return () => {
      if (positionFrameRef.current !== null) {
        window.cancelAnimationFrame(positionFrameRef.current)
        positionFrameRef.current = null
      }

      resizeObserver.disconnect()
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange)
    }
  }, [context.open, side, align, sideOffset, alignOffset, avoidCollisions, context.dir, context.triggerRef, context.contentRef])

  // Focus listbox when opening
  useEffect(() => {
    if (!context.open) {
      return
    }
    context.listRef.current?.focus()
  }, [context.open, context.listRef])

  const commitValue = (nextValue: string) => {
    context.setSelectedValue(nextValue)
    context.setOpen(false)
    context.triggerRef.current?.focus()
  }

  const moveActive = (step: number) => {
    if (enabledItems.length === 0) {
      return
    }

    const currentIndex = enabledItems.findIndex(
      (item) => item.value === context.activeValue,
    )

    const initialIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex = (initialIndex + step + enabledItems.length) % enabledItems.length
    const nextValue = enabledItems[nextIndex].value
    context.setActiveValue(nextValue)
    requestAnimationFrame(() => {
      scrollOptionIntoView(nextValue)
    })
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLUListElement> = (event) => {
    if (event.key === 'Tab') {
      context.setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      const firstEnabled = enabledItems[0]
      const nextValue = firstEnabled?.value ?? null
      context.setActiveValue(nextValue)
      requestAnimationFrame(() => {
        scrollOptionIntoView(nextValue)
      })
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      const nextValue = enabledItems.at(-1)?.value ?? null
      context.setActiveValue(nextValue)
      requestAnimationFrame(() => {
        scrollOptionIntoView(nextValue)
      })
      return
    }

    if (event.key === 'PageDown') {
      event.preventDefault()
      moveActive(10)
      return
    }

    if (event.key === 'PageUp') {
      event.preventDefault()
      moveActive(-10)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      context.setOpen(false)
      context.triggerRef.current?.focus()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const activeItem = context.activeValue
        ? itemByValue.get(context.activeValue)
        : undefined
      if (activeItem && !activeItem.disabled) {
        commitValue(activeItem.value)
      }
      return
    }

    // Typeahead search
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault()
      
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current)
      }

      const newSearchTerm = searchTerm + event.key
      setSearchTerm(newSearchTerm)

      const matchedValue = matchTypeahead(context.items, context.activeValue, newSearchTerm)
      if (matchedValue) {
        context.setActiveValue(matchedValue)
        requestAnimationFrame(() => {
          scrollOptionIntoView(matchedValue)
        })
      }

      searchTimeoutRef.current = window.setTimeout(() => {
        setSearchTerm('')
      }, 1000)
    }
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current !== null) {
        window.clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const content = (
    <div
      ref={(node) => {
        context.setContentNode(node)
      }}
      className={mergeClassNames(styles.content, className)}
      style={style}
      {...props}
    >
      <ul
        ref={(node) => {
          context.setListNode(node)
        }}
        id={context.listboxId}
        role="listbox"
        aria-labelledby={context.labelledBy}
        aria-activedescendant={
          context.activeValue
            ? optionIdByValue.get(context.activeValue)
            : undefined
        }
        aria-hidden={!context.open}
        tabIndex={-1}
        className={styles.list}
        onKeyDown={handleKeyDown}
        style={{ maxHeight }}
      >
        {children}
      </ul>
    </div>
  )

  return <DropdownPortal position={position}>{content}</DropdownPortal>
}

const DropdownItem = forwardRef<HTMLLIElement, DropdownItemProps>(function DropdownItem(
  {
    value,
    disabled = false,
    valueContent,
    textValue,
    className,
    children,
    onMouseMove,
    onClick,
    ...props
  },
  forwardedRef,
) {
  const context = useDropdownContext('Dropdown.Item')
  const { registerItem, unregisterItem } = context
  const optionId = useSafeId()
  const searchTextValue = useMemo(() => {
    const explicitTextValue = textValue?.trim()
    if (explicitTextValue) {
      return explicitTextValue
    }

    const childrenText = extractNodeText(children).replace(/\s+/g, ' ').trim()
    if (childrenText) {
      return childrenText
    }

    return value
  }, [children, textValue, value])

  useEffect(() => {
    registerItem({
      value,
      optionId,
      disabled,
      optionContent: children,
      valueContent,
      textValue: searchTextValue,
    })

    return () => {
      unregisterItem(value)
    }
  }, [
    children,
    disabled,
    optionId,
    registerItem,
    searchTextValue,
    unregisterItem,
    value,
    valueContent,
  ])

  const isSelected = context.selectedValue === value
  const isActive = context.activeValue === value

  const handleMouseMove: DropdownItemProps['onMouseMove'] = (event) => {
    onMouseMove?.(event)
    if (event.defaultPrevented || disabled) {
      return
    }
    context.setActiveValue(value)
  }

  const handleClick: DropdownItemProps['onClick'] = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled) {
      return
    }

    context.setSelectedValue(value)
    context.setOpen(false)
    context.triggerRef.current?.focus()
  }

  const handleKeyDown: DropdownItemProps['onKeyDown'] = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled) {
      event.preventDefault()
      context.setSelectedValue(value)
      context.setOpen(false)
      context.triggerRef.current?.focus()
    }
  }

  return (
    <li
      id={optionId}
      ref={forwardedRef}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      aria-label={searchTextValue}
      data-value={value}
      data-selected={isSelected}
      data-active={isActive}
      className={mergeClassNames(
        styles.item,
        isSelected ? styles.itemSelected : undefined,
        isActive ? styles.itemActive : undefined,
        disabled ? styles.itemDisabled : undefined,
        className,
      )}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className={styles.itemContent}>{children}</span>
      {isSelected && (
        <AccessibleIcon className={styles.itemCheck} label="Selected">
          <CheckIcon />
        </AccessibleIcon>
      )}
    </li>
  )
})

// eslint-disable-next-line react-refresh/only-export-components
export const Dropdown = Object.assign(DropdownRoot, {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Chevron: DropdownChevron,
  Content: DropdownContent,
  Item: DropdownItem,
})

export {
  DropdownRoot,
  DropdownTrigger,
  DropdownChevron,
  DropdownContent,
  DropdownItem,
}
