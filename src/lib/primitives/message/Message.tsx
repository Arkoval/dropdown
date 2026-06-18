import type { HTMLAttributes } from 'react'
import { renderRichText } from '@/lib/common/utils/renderRichText'
import { mergeClassNames } from '@/lib/common/utils'
import styles from './Message.module.css'

type MessageProps = HTMLAttributes<HTMLDivElement> & {
  tone?: 'error' | 'info'
  markdown?: boolean
}

export function Message({
  tone = 'error',
  markdown = false,
  className,
  children,
  ...props
}: MessageProps) {
  const mergedClassName = mergeClassNames(
    styles.root,
    tone === 'error' ? styles.error : styles.info,
    markdown ? 'richText' : undefined,
    className,
  )

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={mergedClassName}
      {...props}
    >
      {renderRichText(children, markdown)}
    </div>
  )
}
