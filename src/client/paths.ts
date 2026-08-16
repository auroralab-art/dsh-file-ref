export type PathPlatform = 'posix' | 'windows'

export function detectPathPlatform(navigatorValue: Navigator = navigator): PathPlatform {
  const userAgentPlatform = (navigatorValue as Navigator & {
    userAgentData?: { platform?: string }
  }).userAgentData?.platform
  const platform = userAgentPlatform ?? navigatorValue.platform
  return /win/i.test(platform) ? 'windows' : 'posix'
}

function pathFromFileUrl(url: URL, platform: PathPlatform): string | undefined {
  if (url.protocol !== 'file:') return undefined
  const pathname = decodeURIComponent(url.pathname)
  if (!pathname.startsWith('/') || pathname === '/') return undefined
  if (platform === 'posix') {
    return url.host === '' || url.host === 'localhost' ? pathname : undefined
  }
  if (url.host !== '' && url.host !== 'localhost') {
    return `\\\\${decodeURIComponent(url.host)}${pathname.replaceAll('/', '\\')}`
  }
  const drivePath = /^\/([A-Za-z]:)(\/.*)$/.exec(pathname)
  if (drivePath === null) return undefined
  return `${drivePath[1]}${drivePath[2].replaceAll('/', '\\')}`
}

/** Parse `text/uri-list` or pasted `file://` lines into native absolute paths. */
export function pathsFromUriList(value: string, platform: PathPlatform = detectPathPlatform()): string[] {
  const paths: string[] = []
  const seen = new Set<string>()
  for (const line of value.split(/\r?\n/)) {
    const candidate = line.trim()
    if (candidate === '' || candidate.startsWith('#')) continue
    let url: URL
    try {
      url = new URL(candidate)
    } catch {
      if (candidate.startsWith('/') || /^[A-Za-z]:[\\/]/.test(candidate)) {
        if (!seen.has(candidate)) {
          seen.add(candidate)
          paths.push(candidate)
        }
      }
      continue
    }
    const path = pathFromFileUrl(url, platform)
    if (path === undefined || seen.has(path)) continue
    seen.add(path)
    paths.push(path)
  }
  return paths
}

/** Read Finder / Explorer URI payloads from a paste or drop DataTransfer. */
export function pathsFromTransfer(
  data: Pick<DataTransfer, 'getData'>,
  platform: PathPlatform = detectPathPlatform(),
): string[] {
  const uriPaths = pathsFromUriList(data.getData('text/uri-list'), platform)
  if (uriPaths.length > 0) return uriPaths
  return pathsFromUriList(data.getData('text/plain'), platform)
}

/** Chromium/Electron `File.path` when the browser exposes the original location. */
export function pathFromFileObject(file: File): string | undefined {
  const path = (file as File & { path?: string }).path
  return typeof path === 'string' && path !== '' ? path : undefined
}
