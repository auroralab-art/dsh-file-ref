# dsh-file-ref

Paste or drop a local file into the DeepSeek Harness composer. The plugin inserts a path the agent can open with existing tools. It does not upload file bytes to the model.

[English](README.md) | [中文](README.zh.md)

## What you get

| File location | Draft text |
|---|---|
| Inside the current workspace | `@docs/spec.pdf` |
| Outside the workspace | `/Users/you/Downloads/spec.pdf` |
| Path hidden by the browser | `@.dsh-inbox/spec.pdf` (copy written under the workspace) |
| PNG / JPEG / WebP / GIF | First-party image rail, unchanged |

Before a step, the host confirms each `@relative` path exists and injects:

```xml
<workspace-reference path="docs/spec.pdf" kind="file" />
```

Absolute paths stay as typed. The agent reads them under the session access mode.

## Install

```sh
git clone https://github.com/auroralab-art/dsh-file-ref.git
cd dsh-file-ref
pnpm install && pnpm run build
dsh plugin --profile web add "$PWD"
```

Restart `dsh web` and hard-refresh the browser.

## Config

`cordis.patch.yml` (or the profile patch):

```yaml
- id: dsh-file-ref
  config:
    inboxDir: .dsh-inbox
    maxStageBytes: 20971520
```

## Develop

```sh
pnpm install
pnpm test
pnpm run build
```

Design notes: [docs/design.md](docs/design.md).
