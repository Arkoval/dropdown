import type { HTMLAttributes, ReactNode } from 'react'
import { mergeClassNames } from '@/lib/common/utils'
import styles from './Tip.module.css'

type TipProps = HTMLAttributes<HTMLSpanElement> & {
  text: string
  children?: ReactNode
}

export function Tip({ text, children, className, ...props }: TipProps) {
  const mergedClassName = mergeClassNames(styles.root, className)

  return (
    <span
      {...props}
      className={mergedClassName}
      title={text}
      aria-label={text}
    >
      {children ?? '?'}
    </span>
  )
}
