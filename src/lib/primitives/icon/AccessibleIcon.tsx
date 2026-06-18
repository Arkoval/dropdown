import { cloneElement } from 'react'
import type { ReactElement, SVGProps } from 'react'

type AccessibleIconProps = {
  children: ReactElement<SVGProps<SVGSVGElement>>
  label?: string
  className?: string
}

export function AccessibleIcon({ children, label, className }: AccessibleIconProps) {
  const icon = cloneElement(children, {
    'aria-hidden': true,
    focusable: 'false',
    tabIndex: -1,
    className,
  })

  if (!label) {
    return icon
  }

  return (
    <>
      {icon}
      <span className="srOnly">{label}</span>
    </>
  )
}
