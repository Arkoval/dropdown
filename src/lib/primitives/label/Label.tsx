import type { LabelHTMLAttributes, ReactNode } from 'react'
import { mergeClassNames } from '@/lib/common/utils'
import styles from './Label.module.css'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean
  optionalText?: ReactNode
}

export function Label({
  children,
  required = false,
  optionalText,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      className={mergeClassNames(styles.root, className)}
      {...props}
    >
      <span>{children}</span>
      {required ? <span className={styles.required}>*</span> : null}
      {!required && optionalText ? (
        <span className={styles.muted}>{optionalText}</span>
      ) : null}
    </label>
  )
}
