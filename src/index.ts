/**
 * Host half: stage pasted bytes into the workspace inbox, and mark
 * `@relative` tokens at each agent's pre-step boundary.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { Buffer } from 'node:buffer'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { mentionPreStep } from './mention.ts'
import { stageFile } from './inbox.ts'
import { FILE_REF_STAGE_ROUTE, type StageRequest, type StageResponse } from './protocol.ts'

export const name = 'dsh-file-ref'
export const inject = ['webServer', 'agents']

export interface Config {
  inboxDir: string
  maxStageBytes: number
}

export const Config: Schema<Config> = Schema.object({
  inboxDir: Schema.string().default('.dsh-inbox'),
  maxStageBytes: Schema.natural().min(1).default(20 * 1024 * 1024),
})

const MAX_BODY_BYTES = 24 * 1024 * 1024

export function apply(ctx: Context, config: Config): void {
  const resolved = config

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: FILE_REF_STAGE_ROUTE,
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { status: 'error', message: 'method not allowed' })
        return
      }
      try {
        const body = await readJson(req)
        if (typeof body.workspacePath !== 'string' || typeof body.name !== 'string' || typeof body.data !== 'string') {
          sendJson(res, 400, { status: 'error', message: 'invalid stage payload' })
          return
        }
        const data = decodeBase64(body.data)
        const staged = await stageFile(body.workspacePath, body.name, data, resolved)
        sendJson(res, 200, {
          status: 'ok',
          absolutePath: staged.absolutePath,
          relative: staged.relative,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        sendJson(res, 400, { status: 'error', message })
      }
    },
  }), 'dsh-file-ref: stage route')

  ctx.on('agent/created', ({ agent }) => {
    agent.ctx.effect(() => {
      const stop = agent.ctx.on('agent/pre-step', async ({ messages, signal }, next) => {
        return mentionPreStep(agent, messages, signal, next)
      })
      return () => { stop() }
    }, 'dsh-file-ref: pre-step mentions')
  })
}

async function readJson(req: IncomingMessage): Promise<StageRequest> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new Error('request body too large')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as StageRequest
}

function decodeBase64(data: string): Uint8Array {
  const decoded = Buffer.from(data, 'base64')
  if (data.length === 0 || decoded.toString('base64') !== data) {
    throw new Error('stage payload is not canonical base64')
  }
  return new Uint8Array(decoded)
}

function sendJson(res: ServerResponse, status: number, body: StageResponse): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}
