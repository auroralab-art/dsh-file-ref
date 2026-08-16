# dsh-file-ref

Paste or drop a local file into the DSH composer. The plugin inserts a path the agent can open with existing tools. It does not upload file bytes to the model.

## Locked decisions

- **C:** Prefer the original filesystem path. If that path cannot be recovered, write the browser bytes into the current workspace inbox and reference that copy.
- **Insert form 3:** Workspace-internal paths become `@relative`. Workspace-external original paths stay absolute plaintext.
- Images (`image/png`, `image/jpeg`, `image/webp`, `image/gif`) stay on the first-party image rail.

## Insert table

| Resolved location | Draft text |
|---|---|
| Inside current workspace | `@docs/spec.pdf` |
| Outside workspace | `/Users/you/Downloads/spec.pdf` |
| Path hidden; bytes staged | `@.dsh-inbox/spec.pdf` |
| PNG / JPEG / WebP / GIF | unchanged image draft |

## Roles

| Piece | Owns |
|---|---|
| Client | Capture-phase paste/drop for non-image files; classify; insert text |
| Host `/file-ref/stage` | Write sanitized bytes under `<workspace>/<inboxDir>/` |
| Host `agent/pre-step` | Confirm `@relative` exists in the workspace; inject `<workspace-reference>` |

Absolute paths are not rewritten at pre-step. The agent reads them under the session access mode.

## Out of v1

- First-party `InputBar` intake hook (this out-of-tree plugin captures the event first)
- OS file-index locator (Spotlight / plocate). Add later to raise original-path hit rate before staging
- Vendoring `dsh-at-file` or `dsh-drag-and-drop`
