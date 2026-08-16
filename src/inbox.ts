import { mkdir, writeFile, stat } from 'node:fs/promises'
import { isAbsolute, join, relative as pathRelative, resolve, sep } from 'node:path'
import type { ResolvedConfig } from './types.ts'

/** One successful inbox write. */
export interface StagedFile {
  readonly absolutePath: string
  readonly relative: string
}

/**
 * Keep only a single path segment so a pasted name cannot escape the inbox.
 * @param name - browser File.name.
 */
export function safeBasename(name: string): string {
  const segment = name.split(/[/\\]/).filter(part => part !== '' && part !== '.' && part !== '..').pop()
  if (segment === undefined) return 'file'
  return segment
}

/**
 * Write bytes under `<workspace>/<inboxDir>/`, picking a free name on collision.
 * @param workspacePath - session workspace root.
 * @param name - display name from the browser File.
 * @param data - raw bytes.
 * @param config - inbox directory and size cap.
 */
export async function stageFile(
  workspacePath: string,
  name: string,
  data: Uint8Array,
  config: ResolvedConfig,
): Promise<StagedFile> {
  if (!isAbsolute(workspacePath)) {
    throw new Error('workspace path must be absolute')
  }
  if (data.byteLength > config.maxStageBytes) {
    throw new Error(`file exceeds ${config.maxStageBytes} bytes`)
  }
  const inbox = resolve(workspacePath, config.inboxDir)
  const confined = pathRelative(workspacePath, inbox)
  if (confined === '..' || confined.startsWith(`..${sep}`) || isAbsolute(confined)) {
    throw new Error('inbox directory escapes the workspace')
  }
  await mkdir(inbox, { recursive: true })
  const absolutePath = await uniquePath(inbox, safeBasename(name))
  await writeFile(absolutePath, data)
  const relative = pathRelative(workspacePath, absolutePath).split(sep).join('/')
  return { absolutePath, relative }
}

async function uniquePath(directory: string, basename: string): Promise<string> {
  const candidate = join(directory, basename)
  if (!await exists(candidate)) return candidate
  const dot = basename.lastIndexOf('.')
  const stem = dot > 0 ? basename.slice(0, dot) : basename
  const ext = dot > 0 ? basename.slice(dot) : ''
  for (let n = 2; n < 10_000; n += 1) {
    const next = join(directory, `${stem}-${n}${ext}`)
    if (!await exists(next)) return next
  }
  throw new Error('could not allocate an inbox name')
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}
