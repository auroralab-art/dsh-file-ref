import { isAbsolute, relative as pathRelative, resolve, sep } from 'node:path'
import { stat } from 'node:fs/promises'
import type { UserMessage } from '@deepseek-ai/dsh-llm'
import type { PreStepDecision } from '@deepseek-ai/dsh-agent'
import { scanMentions } from './scan.ts'

function createUserMessage(input: {
  readonly content: UserMessage['content']
  readonly source: UserMessage['source']
}): UserMessage {
  return {
    id: crypto.randomUUID() as UserMessage['id'],
    role: 'user',
    content: input.content,
    source: input.source,
  }
}

export { scanMentions } from './scan.ts'

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'file-ref-mention': { kind: 'file-ref-mention'; relative: string }
  }
}

/** One workspace-relative mention confirmed on disk. */
export interface Mention {
  readonly relative: string
  readonly kind: 'file' | 'dir'
}

/** Resolve one token inside cwd; missing or escaping paths are skipped. */
export async function resolveMention(
  token: string,
  cwd: string,
  signal: AbortSignal,
): Promise<Mention | undefined> {
  if (isAbsolute(token)) return undefined
  const absolute = resolve(cwd, token)
  const confined = pathRelative(cwd, absolute)
  if (confined === '..' || confined.startsWith(`..${sep}`) || isAbsolute(confined)) return undefined
  signal.throwIfAborted()
  const info = await stat(absolute).catch(() => undefined)
  signal.throwIfAborted()
  if (info === undefined) return undefined
  return {
    relative: confined.split(sep).join('/') || '.',
    kind: info.isDirectory() ? 'dir' : 'file',
  }
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function referenceForm(mention: Mention): string {
  const kind = mention.kind === 'dir' ? 'directory' : 'file'
  return `<workspace-reference path="${escapeAttribute(mention.relative)}" kind="${kind}" />`
}

/** Build existence-only injections for every valid `@relative` in user text. */
export async function expandMentions(
  messages: readonly UserMessage[],
  cwd: string | undefined,
  signal: AbortSignal,
): Promise<UserMessage[]> {
  if (cwd === undefined || !isAbsolute(cwd)) return []
  const tokens: string[] = []
  for (const message of messages) {
    if (message.source.kind !== 'user') continue
    for (const block of message.content) {
      if (block.type !== 'text') continue
      tokens.push(...scanMentions(block.text))
    }
  }
  const injections: UserMessage[] = []
  for (const token of tokens) {
    signal.throwIfAborted()
    const mention = await resolveMention(token, cwd, signal)
    if (mention === undefined) continue
    injections.push(createUserMessage({
      content: [{ type: 'text', text: referenceForm(mention) }],
      source: { kind: 'file-ref-mention', relative: mention.relative },
    }))
  }
  return injections
}

export interface MentionAgent {
  session: { header: { cwd?: string } }
}

/** `agent/pre-step` body: append reference markers after the downstream decision. */
export async function mentionPreStep(
  agent: MentionAgent,
  messages: readonly UserMessage[],
  signal: AbortSignal,
  next: () => Promise<PreStepDecision>,
): Promise<PreStepDecision> {
  const decision = await next()
  if (decision.kind === 'reject') return decision
  const injections = await expandMentions(messages, agent.session.header.cwd, signal)
  if (injections.length === 0) return decision
  return { kind: 'enter', messages: [...decision.messages, ...injections] }
}
