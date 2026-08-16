# dsh-file-ref

English | [中文](README.zh.md)

Paste or drop a local file into the DeepSeek Harness composer. The plugin inserts a path the agent can open with existing tools. It does not upload file bytes to the model.

## What it does

| File location | Draft text |
|---|---|
| Inside the current workspace | `@docs/spec.pdf` |
| Outside the workspace | `/Users/you/Downloads/spec.pdf` |
| Path hidden by the browser | `@.dsh-inbox/spec.pdf` (a copy under the workspace) |
| PNG / JPEG / WebP / GIF | First-party image rail, unchanged |

Before a step, the host confirms each `@relative` path still exists and injects:

```xml
<workspace-reference path="docs/spec.pdf" kind="file" />
```

Absolute paths stay as typed. The agent reads them with the session's usual tools and access mode.

## What it adds

Without this plugin, the composer accepts only PNG, JPEG, WebP, and GIF. Other files are rejected as an unsupported image format.

`dsh-file-ref` adds a path-reference path for those files:

- Recover the original filesystem path when the browser or host can see it.
- Otherwise write a copy into the workspace inbox and `@` that path.
- Mark `@relative` mentions before the model step so the agent can open the file with `read`, the shell, or other tools already in the session.

There is no new upload API and no extra model-facing file tool.

## Install

```sh
git clone https://github.com/auroralab-art/dsh-file-ref.git
cd dsh-file-ref
pnpm install && pnpm run build
dsh plugin --profile web add "$PWD"
```

Restart `dsh web` and hard-refresh the browser.

Optional config on the plugin row (`inboxDir`, `maxStageBytes`) lives in `cordis.patch.yml`.

## Aurora Lab

This plugin is published by [Aurora Lab](https://github.com/auroralab-art). We are building a set of DeepSeek Harness plugins that extend what DSH can do.

## License

Not MIT. See [LICENSE](LICENSE) ([中文](LICENSE.zh.md)).

You may download and install this software for personal, non-commercial use. Contact the owner through [auroralab-art](https://github.com/auroralab-art) before any modification or derivative work. Commercial use requires the owner's written consent.

## Develop

```sh
pnpm install
pnpm test
pnpm run build
```
