/** Image MIME types that stay on the first-party composer image rail. */
export const IMAGE_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

/** True when the browser-declared MIME is a first-party image type. */
export function isImageMediaType(type: string): boolean {
  return (IMAGE_MEDIA_TYPES as readonly string[]).includes(type)
}

/**
 * Collapse an absolute path onto a workspace root.
 * @param absolutePath - native absolute path.
 * @param workspaceRoot - session workspace directory.
 * @returns a `/`-separated relative path, or `undefined` when the file is outside the workspace.
 */
export function toWorkspaceRelative(absolutePath: string, workspaceRoot: string): string | undefined {
  const file = normalizeAbsolute(absolutePath)
  const root = normalizeAbsolute(workspaceRoot)
  if (file === root) return '.'
  const prefix = root.endsWith('/') ? root : `${root}/`
  if (!file.startsWith(prefix)) return undefined
  return file.slice(prefix.length)
}

/**
 * Draft text for one resolved path (insert form 3).
 * @param absolutePath - native absolute path of the original file or inbox copy.
 * @param workspaceRoot - current session workspace; omit when unknown.
 * @returns `@relative` inside the workspace, otherwise the absolute path.
 */
export function formatInsert(absolutePath: string, workspaceRoot: string | undefined): string {
  if (workspaceRoot === undefined || workspaceRoot === '') return normalizeAbsolute(absolutePath)
  const relative = toWorkspaceRelative(absolutePath, workspaceRoot)
  return relative === undefined ? normalizeAbsolute(absolutePath) : `@${relative}`
}

/** Join several insert tokens the way the composer draft should receive them. */
export function formatInsertBlock(paths: readonly string[], workspaceRoot: string | undefined): string {
  return paths.map(path => formatInsert(path, workspaceRoot)).join('\n')
}

function normalizeAbsolute(value: string): string {
  const trimmed = value.trim()
  const posix = /^[A-Za-z]:[\\/]/.test(trimmed)
    ? trimmed.replaceAll('\\', '/')
    : trimmed
  if (posix.length > 1 && posix.endsWith('/')) return posix.slice(0, -1)
  return posix
}
