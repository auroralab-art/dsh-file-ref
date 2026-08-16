/** Host route that writes one pasted file into the workspace inbox. */
export const FILE_REF_STAGE_ROUTE = '/file-ref/stage'

/** Browser → host payload for one staged file. */
export interface StageRequest {
  readonly workspacePath: string
  readonly name: string
  /** Canonical base64 of the file bytes. */
  readonly data: string
}

/** Host → browser result after an inbox write. */
export type StageResponse =
  | { readonly status: 'ok'; readonly absolutePath: string; readonly relative: string }
  | { readonly status: 'error'; readonly message: string }
