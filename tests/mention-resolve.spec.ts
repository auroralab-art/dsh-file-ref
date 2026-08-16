import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveMention } from '../src/mention.ts'

describe('resolveMention', () => {
  it('accepts a file inside the workspace', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-ref-mention-'))
    await mkdir(join(root, 'docs'))
    await writeFile(join(root, 'docs', 'spec.pdf'), 'x')
    const mention = await resolveMention('docs/spec.pdf', root, new AbortController().signal)
    expect(mention).toEqual({ relative: 'docs/spec.pdf', kind: 'file' })
  })

  it('rejects a path that escapes the workspace', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-ref-mention-'))
    const mention = await resolveMention('../outside.pdf', root, new AbortController().signal)
    expect(mention).toBeUndefined()
  })

  it('rejects a missing file', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-ref-mention-'))
    const mention = await resolveMention('nope.txt', root, new AbortController().signal)
    expect(mention).toBeUndefined()
  })
})
