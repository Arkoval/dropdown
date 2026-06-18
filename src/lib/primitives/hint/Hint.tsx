import type { HTMLAttributes } from 'react'
import { renderRichText } from '@/lib/common/utils/renderRichText'
import { mergeClassNames } from '@/lib/common/utils'
import styles from './Hint.module.css'

type HintProps = HTMLAttributes<HTMLDivElement> & {
  markdown?: boolean
}

export function Hint({ markdown = false, className, children, ...props }: HintProps) {
  const mergedClassName = mergeClassNames(
    styles.root,
    markdown ? 'richText' : undefined,
    className,
  )

  return (
    <div className={mergedClassName} {...props}>
      {renderRichText(children, markdown)}
    </div>
  )
}
