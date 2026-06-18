import { describe, expect, it } from 'vitest'
import { mergeClassNames } from './classNames'

describe('mergeClassNames', () => {
  it('joins only truthy class names in order', () => {
    expect(mergeClassNames('base', undefined, 'active', '', 'size-md')).toBe('base active size-md')
  })
})
