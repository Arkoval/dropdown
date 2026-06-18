import type { Position } from '@/lib/common/utils/positioning'
import type { Direction } from '@/lib/common/types'
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react'

export type DropdownItemRecord = {
  value: string
  optionId: string
  disabled: boolean
  optionContent: ReactNode
  valueContent?: ReactNode
  textValue?: string
}

export type DropdownContextValue = {
  dir: Direction
  disabled: boolean
  error: boolean
  open: boolean
  setOpen: (next: boolean) => void
  selectedValue: string | null
  setSelectedValue: (next: string) => void
  activeValue: string | null
  setActiveValue: (next: string | null) => void
  triggerId: string
  listboxId: string
  labelledBy?: string
  describedBy?: string
  triggerRef: React.MutableRefObject<HTMLElement | null>
  listRef: React.MutableRefObject<HTMLUListElement | null>
  rootRef: React.MutableRefObject<HTMLDivElement | null>
  contentRef: React.MutableRefObject<HTMLDivElement | null>
  setTriggerNode: (node: HTMLElement | null) => void
  setListNode: (node: HTMLUListElement | null) => void
  setContentNode: (node: HTMLDivElement | null) => void
  items: DropdownItemRecord[]
  registerItem: (item: DropdownItemRecord) => void
  unregisterItem: (value: string) => void
}

export type DropdownPortalProps = {
  position: Position | null
  children: ReactNode
}

export type DropdownPortalStyle = CSSProperties & {
  '--dropdown-trigger-width'?: string
}


export type DropdownRootProps = {
  id?: string
  disabled?: boolean
  error?: boolean
  labelledBy?: string
  describedBy?: string
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  className?: string
}

export type DropdownTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export type DropdownContentProps = HTMLAttributes<HTMLDivElement> & {
  maxHeight?: number
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  alignOffset?: number
  avoidCollisions?: boolean
}

export type DropdownItemProps = Omit<HTMLAttributes<HTMLLIElement>, 'value'> & {
  value: string
  disabled?: boolean
  valueContent?: ReactNode
  textValue?: string
}

