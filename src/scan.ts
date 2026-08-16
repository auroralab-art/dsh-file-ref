import { isAbsolute } from 'node:path'

/** `@` then a relative path with no whitespace and no second `@`. */
const MENTION_PATTERN = /@([^\s@]+)/g

/**
 * Collect unique `@relative` tokens from user-authored text.
 * Absolute `@/…` tokens are ignored — insert form 3 leaves those as plaintext paths.
 */
export function scanMentions(text: string): readonly string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const match of text.matchAll(MENTION_PATTERN)) {
    const raw = match[1] as string
    const relative = raw.endsWith('/') ? raw.slice(0, -1) : raw
    if (relative === '' || isAbsolute(relative) || seen.has(relative)) continue
    seen.add(relative)
    out.push(relative)
  }
  return out
}
