/** Loader-resolved host configuration. */
export interface ResolvedConfig {
  /** Directory name under the workspace root that receives staged copies. */
  readonly inboxDir: string
  /** Maximum encoded bytes accepted for one staged file. */
  readonly maxStageBytes: number
}
