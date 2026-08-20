<!--
  dsh-file-ref: DeepSeek Harness file attachment plugin
  Keywords: deepseek harness plugin, dsh plugin, file drag and drop,
  paste file, workspace reference, ai agent file access, cordis plugin,
  local file attachment, dsh-file-ref, aurora lab
-->

<div align="center">

# dsh-file-ref

**Add file attachment support to [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).**

[![Version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/auroralab-art/dsh-file-ref/releases)
[![License](https://img.shields.io/badge/license-Aurora%20Lab%20Source-orange)](LICENSE)
[![DSH](https://img.shields.io/badge/DSH-v0.1.0--rc.1+-green)](https://github.com/deepseek-ai/deepseek-harness)

English | [中文](README.zh.md)

</div>

---

Drag-and-drop or paste any local file — PDF, CSV, code, or document — into the DSH web composer. The plugin resolves the filesystem path and inserts an `@workspace` reference the agent opens with existing tools. No upload API, no extra model context.

## Why do I need this?

Without this plugin, the DSH composer **only accepts PNG, JPEG, WebP, and GIF**. Any other file is rejected as an unsupported image format.

`dsh-file-ref` bridges that gap:

- Recover the original filesystem path when the browser or host can see it.
- Otherwise write a copy into the workspace inbox and `@` that path.
- Mark `@relative` mentions before the model step so the agent can open the file with `read`, the shell, or other tools already in the session.

There is no new upload API and no extra model-facing file tool. The agent uses whatever access mode the session already provides.

## Quick Start

Requires the `dsh` CLI and the `web` profile.

```sh
dsh plugin --profile web add https://github.com/auroralab-art/dsh-file-ref/releases/download/v0.1.0/dsh-file-ref-0.1.0.tgz
```

Restart `dsh web` and hard-refresh the browser. Done.

To remove:

```sh
dsh plugin --profile web remove dsh-file-ref
```

## How does it work?

| File location | Draft text inserted |
|---|---|
| Inside the current workspace | `@docs/spec.pdf` |
| Outside the workspace | `/Users/you/Downloads/spec.pdf` |
| Path hidden by the browser | `@.dsh-inbox/spec.pdf` (a copy under the workspace) |
| PNG / JPEG / WebP / GIF | First-party image rail, unchanged |

Before a step, the host confirms each `@relative` path still exists and injects:

```xml
<workspace-reference path="docs/spec.pdf" kind="file" />
```

Absolute paths stay as typed. The plugin does not open the file or send its bytes. The agent reads the path with the session's usual tools and access mode.

## How are file paths resolved?

- Paste and drop of PNG, JPEG, WebP, and GIF stay on the first-party image rail.
- A path inside the workspace is inserted as `@relative`. A path outside the workspace is inserted as absolute text.
- When the browser hides the filesystem path, the host writes a copy under `inboxDir` and the draft `@`s that relative path.
- Reference markers are created only from `@relative` tokens that still exist inside the workspace.
- Absolute paths stay as typed. The plugin does not rewrite them into mentions.
- File format does not change this flow. A staged copy must be within `maxStageBytes`.
- DSH `read` opens UTF-8 text. Other formats use the session's shell or other tools.

## Configuration

Optional keys go in `~/.dsh/profiles/web/cordis.patch.yml`. A later layer replaces the whole `config` object, so restate every key you set.

```yaml
- id: dsh-file-ref
  config:
    inboxDir: .dsh-inbox
    maxStageBytes: 20971520
```

| Key | Default | Description |
|-----|---------|-------------|
| `inboxDir` | `.dsh-inbox` | Workspace-relative directory for copies when the browser hides the original path |
| `maxStageBytes` | `20971520` (20 MiB) | Maximum size of one staged copy |

## FAQ

<details>
<summary><strong>Does this upload files to the model?</strong></summary>

No. The plugin inserts a *path* into the composer text. The agent opens the file using the session's existing tools (`read`, shell, etc.). File bytes are never sent to the LLM context through this plugin.
</details>

<details>
<summary><strong>What file formats are supported?</strong></summary>

All formats except PNG, JPEG, WebP, and GIF (which use the built-in image rail). Common use cases include PDF, CSV, JSON, YAML, source code, Markdown, and any text-based document.
</details>

<details>
<summary><strong>Can I use this with headless mode?</strong></summary>

No. This plugin targets the `web` profile only, as it relies on browser paste/drop events and the composer UI.
</details>

<details>
<summary><strong>What happens with large files?</strong></summary>

Files staged into the inbox are capped by `maxStageBytes` (default 20 MiB). The agent still needs to read the file through standard tools, so very large files may hit the session's own limits.
</details>

<details>
<summary><strong>Which DSH version is required?</strong></summary>

Tested against DeepSeek Harness `v0.1.0-rc.1` and later. Plugin contracts may change between DSH preview releases — pin the version you test against.
</details>

## Compatibility

| Requirement | Version |
|---|---|
| DeepSeek Harness | `v0.1.0-rc.1`+ |
| Node.js | `^22.19.0` or `>=24.0.0` |
| Profile | `web` |

## Aurora Lab

This plugin is published by [Aurora Lab](https://github.com/auroralab-art). We build plugins that extend what DeepSeek Harness can do.

**Other plugins from Aurora Lab:**

- [dsh-access](https://github.com/auroralab-art/dsh-access) — Remote access gateway with role tokens and device binding
- [dsh-msg-revise](https://github.com/auroralab-art/dsh-msg-revise) — Edit and resend messages after the agent stops

## License

Not MIT. See [LICENSE](LICENSE) ([中文](LICENSE.zh.md)).

You may download and install this software for personal, non-commercial use. Contact the owner through [auroralab-art](https://github.com/auroralab-art) before any modification or derivative work. Commercial use requires the owner's written consent.

## Develop

```sh
pnpm install
pnpm test
pnpm run build
dsh plugin --profile web add "$PWD"
```

`add "$PWD"` links this checkout into the profile. Keep the directory. That is the development path, not the install command for other machines.

The build expects a `deepseek-harness` checkout at `../../deepseek-harness`, or `DSH_CHECKOUT`.
