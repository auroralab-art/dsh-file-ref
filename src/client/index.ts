/**
 * Browser half: intercept non-image paste/drop, insert @relative or absolute
 * paths, and leave first-party image intake untouched.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { IConversation } from '@deepseek-ai/dsh-client-ui-conversation/client'
import { isImageMediaType } from '../format.ts'
import { resolveLocalFile, insertTextFor } from './intake.ts'
import { pathsFromTransfer } from './paths.ts'

export { pathsFromTransfer, pathsFromUriList } from './paths.ts'
export { formatInsert, formatInsertBlock, isImageMediaType } from '../format.ts'

export const inject = ['sessions', 'conversation']

type SessionInput = ReturnType<IConversation['input']['for']>

function currentInput(ctx: ClientContext): SessionInput | undefined {
  const sessionId = ctx.sessions.list.getSnapshot().current
  if (sessionId === undefined) return undefined
  const scope = ctx.sessions.scope(sessionId)
  const conversation = ctx.get('conversation')
  return scope === undefined || conversation === undefined ? undefined : conversation.input.for(scope)
}

function currentWorkspacePath(ctx: ClientContext): string | undefined {
  const sessionId = ctx.sessions.list.getSnapshot().current
  return sessionId === undefined ? undefined : ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd
}

function filesFrom(list: DataTransferItemList | undefined): File[] {
  if (list === undefined) return []
  return [...list].flatMap((item) => {
    if (item.kind !== 'file') return []
    const file = item.getAsFile()
    return file === null ? [] : [file]
  })
}

function hasNonImageFiles(files: readonly File[]): boolean {
  return files.some(file => !isImageMediaType(file.type))
}

function appendDraft(input: SessionInput, text: string): void {
  const draft = input.state.getSnapshot().draft
  input.setDraft(draft === '' ? text : `${draft}\n${text}`)
}

function canClaim(ctx: ClientContext): boolean {
  const input = currentInput(ctx)
  if (input === undefined) return false
  const phase = input.state.getSnapshot().phase
  return phase === 'plain' || phase === 'claimed'
}

async function intakeNonImages(
  ctx: ClientContext,
  files: readonly File[],
  listed: readonly string[],
): Promise<void> {
  const input = currentInput(ctx)
  if (input === undefined) return
  const workspace = currentWorkspacePath(ctx)
  const locals = files.filter(file => !isImageMediaType(file.type))
  const paths: string[] = []
  const failures: string[] = []
  for (const file of locals) {
    try {
      paths.push(await resolveLocalFile(file, listed, workspace))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push(`${file.name}: ${message}`)
    }
  }
  if (paths.length > 0) appendDraft(input, insertTextFor(paths, workspace))
  if (failures.length > 0) input.notify('error', `未能引用文件：${failures.join('；')}`)
}

export function apply(ctx: ClientContext): void {
  const onPaste = (event: ClipboardEvent): void => {
    const files = filesFrom(event.clipboardData?.items)
    if (files.length === 0 || !hasNonImageFiles(files) || !canClaim(ctx)) return
    const listed = event.clipboardData === null ? [] : pathsFromTransfer(event.clipboardData)
    event.preventDefault()
    event.stopPropagation()
    void intakeNonImages(ctx, files, listed)
  }
  const onDrop = (event: DragEvent): void => {
    const files = filesFrom(event.dataTransfer?.items)
    if (files.length === 0 || !hasNonImageFiles(files) || !canClaim(ctx)) return
    const listed = event.dataTransfer === null ? [] : pathsFromTransfer(event.dataTransfer)
    event.preventDefault()
    event.stopPropagation()
    window.dispatchEvent(new Event('dragend'))
    void intakeNonImages(ctx, files, listed)
  }
  const onDragOver = (event: DragEvent): void => {
    const types = event.dataTransfer?.types ?? []
    if (!types.includes('Files')) return
    // Only claim the drop when a non-image is present; image-only stays official.
    const files = filesFrom(event.dataTransfer?.items)
    if (files.length > 0 && !hasNonImageFiles(files)) return
    if (files.length === 0 && types.includes('Files')) {
      event.preventDefault()
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy'
    }
    if (hasNonImageFiles(files)) {
      event.preventDefault()
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy'
    }
  }
  document.addEventListener('paste', onPaste, true)
  document.addEventListener('drop', onDrop, true)
  document.addEventListener('dragover', onDragOver, true)
  ctx.effect(() => () => {
    document.removeEventListener('paste', onPaste, true)
    document.removeEventListener('drop', onDrop, true)
    document.removeEventListener('dragover', onDragOver, true)
  }, 'dsh-file-ref: paste and drop')
}
