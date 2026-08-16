import { describe, expect, it } from 'vitest'
import { pathsFromUriList } from '../src/client/paths.ts'

describe('pathsFromUriList', () => {
  it('decodes POSIX file URLs', () => {
    expect(pathsFromUriList('file:///Users/you/Downloads/spec.pdf', 'posix'))
      .toEqual(['/Users/you/Downloads/spec.pdf'])
  })

  it('accepts a bare POSIX path line', () => {
    expect(pathsFromUriList('/Users/you/Downloads/spec.pdf', 'posix'))
      .toEqual(['/Users/you/Downloads/spec.pdf'])
  })

  it('skips comments and blanks', () => {
    expect(pathsFromUriList('# comment\n\nfile:///tmp/a.txt', 'posix')).toEqual(['/tmp/a.txt'])
  })
})
