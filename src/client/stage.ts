import { FILE_REF_STAGE_ROUTE, type StageResponse } from '../protocol.ts'

function bytesToBase64(data: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let offset = 0; offset < data.byteLength; offset += chunk) {
    binary += String.fromCharCode(...data.subarray(offset, offset + chunk))
  }
  return btoa(binary)
}

/** POST one File's bytes to the host inbox. */
export async function stageBrowserFile(file: File, workspacePath: string): Promise<string> {
  const data = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
  const response = await fetch(FILE_REF_STAGE_ROUTE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ workspacePath, name: file.name, data }),
  })
  const body = await response.json() as StageResponse
  if (body.status !== 'ok') {
    throw new Error(body.status === 'error' ? body.message : `HTTP ${response.status}`)
  }
  return body.absolutePath
}
