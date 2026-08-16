import { formatInsertBlock } from '../format.ts'
import { pathFromFileObject, pathsFromTransfer } from './paths.ts'
import { stageBrowserFile } from './stage.ts'

function basename(path: string): string {
  const normalized = path.replaceAll('\\', '/')
  const slash = normalized.lastIndexOf('/')
  return slash === -1 ? normalized : normalized.slice(slash + 1)
}

/**
 * Recover one original path from the transfer or File.path, else stage a copy.
 * @param file - browser File from paste/drop.
 * @param transfer - originating DataTransfer, when the event still holds it.
 * @param workspacePath - current session cwd.
 */
export async function resolveLocalFile(
  file: File,
  listed: readonly string[],
  workspacePath: string | undefined,
): Promise<string> {
  const direct = pathFromFileObject(file)
  if (direct !== undefined) return direct
  const named = listed.find(path => basename(path) === file.name)
  if (named !== undefined) return named
  if (listed.length === 1) return listed[0] as string
  if (workspacePath === undefined) {
    throw new Error(`no original path for ${file.name} and no workspace to stage into`)
  }
  return stageBrowserFile(file, workspacePath)
}

/** Format many resolved paths for one draft insertion. */
export function insertTextFor(paths: readonly string[], workspacePath: string | undefined): string {
  return formatInsertBlock(paths, workspacePath)
}
