import { describe, expect, it } from 'vitest'
import { matchTypeahead } from './typeahead'

describe('matchTypeahead', () => {
  const items = [
    { value: 'alpha', textValue: 'Alpha', disabled: false },
    { value: 'apricot', textValue: 'Apricot', disabled: false },
    { value: 'beta', textValue: 'Beta', disabled: true },
    { value: 'bravo', textValue: 'Bravo', disabled: false },
  ]

  it('matches enabled items by normalized query and skips disabled options', () => {
    expect(matchTypeahead(items, null, '  br  ')).toBe('bravo')
    expect(matchTypeahead(items, null, 'be')).toBeNull()
  })

  it('cycles through repeated-character queries', () => {
    expect(matchTypeahead(items, 'alpha', 'aaa')).toBe('apricot')
    expect(matchTypeahead(items, 'apricot', 'aa')).toBe('alpha')
  })
})
