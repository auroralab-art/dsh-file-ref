import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { safeBasename, stageFile } from '../src/inbox.ts'

const config = { inboxDir: '.dsh-inbox', maxStageBytes: 1024 }

describe('safeBasename', () => {
  it('strips path separators', () => {
    expect(safeBasename('../etc/passwd')).toBe('passwd')
    expect(safeBasename('spec.pdf')).toBe('spec.pdf')
  })
})

describe('stageFile', () => {
  it('writes under the inbox and returns a workspace-relative path', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-ref-'))
    const staged = await stageFile(root, 'spec.pdf', new Uint8Array([1, 2, 3]), config)
    expect(staged.relative).toBe('.dsh-inbox/spec.pdf')
    expect(await readFile(staged.absolutePath)).toEqual(Buffer.from([1, 2, 3]))
  })

  it('allocates a suffix when the name already exists', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-ref-'))
    await stageFile(root, 'spec.pdf', new Uint8Array([1]), config)
    const second = await stageFile(root, 'spec.pdf', new Uint8Array([2]), config)
    expect(second.relative).toBe('.dsh-inbox/spec-2.pdf')
  })

  it('refuses a relative workspace path', async () => {
    await expect(stageFile('relative', 'a.txt', new Uint8Array([1]), config))
      .rejects.toThrow(/absolute/)
  })

  it('does not overwrite an existing same-name file written outside this helper', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-ref-'))
    const first = await stageFile(root, 'keep.pdf', new Uint8Array([9]), config)
    await writeFile(first.absolutePath, Buffer.from([9]))
    const second = await stageFile(root, 'keep.pdf', new Uint8Array([8]), config)
    expect(second.relative).toBe('.dsh-inbox/keep-2.pdf')
    expect(await readFile(first.absolutePath)).toEqual(Buffer.from([9]))
  })
})
