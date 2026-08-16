import { describe, expect, it } from 'vitest'
import { scanMentions } from '../src/scan.ts'

describe('scanMentions', () => {
  it('collects unique relative @tokens', () => {
    expect(scanMentions('see @docs/spec.pdf and @docs/spec.pdf')).toEqual(['docs/spec.pdf'])
  })

  it('strips a trailing slash from directory tokens', () => {
    expect(scanMentions('open @src/')).toEqual(['src'])
  })

  it('ignores absolute @/paths so insert-form-3 plaintext stays unrewritten', () => {
    expect(scanMentions('also @/Users/you/Downloads/spec.pdf')).toEqual([])
  })
})
