import { describe, expect, it } from 'vitest'
import { formatInsert, formatInsertBlock, isImageMediaType, toWorkspaceRelative } from '../src/format.ts'

describe('isImageMediaType', () => {
  it('accepts the four first-party rasters', () => {
    expect(isImageMediaType('image/png')).toBe(true)
    expect(isImageMediaType('application/pdf')).toBe(false)
  })
})

describe('toWorkspaceRelative', () => {
  it('returns a slash-separated relative path inside the workspace', () => {
    expect(toWorkspaceRelative('/Users/you/proj/docs/spec.pdf', '/Users/you/proj')).toBe('docs/spec.pdf')
  })

  it('returns undefined outside the workspace', () => {
    expect(toWorkspaceRelative('/Users/you/Downloads/spec.pdf', '/Users/you/proj')).toBeUndefined()
  })
})

describe('formatInsert', () => {
  it('uses @relative inside the workspace', () => {
    expect(formatInsert('/Users/you/proj/docs/spec.pdf', '/Users/you/proj')).toBe('@docs/spec.pdf')
  })

  it('uses absolute plaintext outside the workspace', () => {
    expect(formatInsert('/Users/you/Downloads/spec.pdf', '/Users/you/proj'))
      .toBe('/Users/you/Downloads/spec.pdf')
  })

  it('uses @relative for an inbox copy', () => {
    expect(formatInsert('/Users/you/proj/.dsh-inbox/spec.pdf', '/Users/you/proj'))
      .toBe('@.dsh-inbox/spec.pdf')
  })

  it('joins several inserts with newlines', () => {
    expect(formatInsertBlock(
      ['/Users/you/proj/a.ts', '/Users/you/Downloads/b.pdf'],
      '/Users/you/proj',
    )).toBe('@a.ts\n/Users/you/Downloads/b.pdf')
  })
})
