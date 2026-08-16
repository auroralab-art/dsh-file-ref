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

Absolute paths stay as typed. The plugin does not open the file or send its bytes. The agent reads the path with the session's usual tools and access mode.

## What it adds

Without this plugin, the composer accepts only PNG, JPEG, WebP, and GIF. Other files are rejected as an unsupported image format.

`dsh-file-ref` adds a path-reference path for those files:

- Recover the original filesystem path when the browser or host can see it.
- Otherwise write a copy into the workspace inbox and `@` that path.
- Mark `@relative` mentions before the model step so the agent can open the file with `read`, the shell, or other tools already in the session.

There is no new upload API and no extra model-facing file tool.

## Install or Update

Requires the `dsh` CLI and the `web` profile.

```sh
dsh plugin --profile web add https://github.com/auroralab-art/dsh-file-ref/releases/download/v0.1.0/dsh-file-ref-0.1.0.tgz
```

Use the same command to update an existing installation. Restart `dsh web` and hard-refresh the browser so the host and the client both load `0.1.0`.

```sh
dsh plugin --profile web remove dsh-file-ref
```

## Configuration

Optional keys go in `~/.dsh/profiles/web/cordis.patch.yml`. A later layer replaces the whole `config` object, so restate every key you set.

```yaml
- id: dsh-file-ref
  config:
    inboxDir: .dsh-inbox
    maxStageBytes: 20971520
```

- `inboxDir` — workspace-relative directory for copies when the browser hides the original path. Default `.dsh-inbox`.
- `maxStageBytes` — maximum size of one staged copy. Default `20971520` (20 MiB).

## Path handling

- Paste and drop of PNG, JPEG, WebP, and GIF stay on the first-party image rail.
- A path inside the workspace is inserted as `@relative`. A path outside the workspace is inserted as absolute text.
- When the browser hides the filesystem path, the host writes a copy under `inboxDir` and the draft `@`s that relative path.
- Reference markers are created only from `@relative` tokens that still exist inside the workspace.
- Absolute paths stay as typed. The plugin does not rewrite them into mentions.
- File format does not change this flow. A staged copy must be within `maxStageBytes`.
- DSH `read` opens UTF-8 text. Other formats use the session's shell or other tools.

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
dsh plugin --profile web add "$PWD"
```

`add "$PWD"` links this checkout into the profile. Keep the directory. That is the development path, not the install command for other machines.

The build expects a `deepseek-harness` checkout at `../../deepseek-harness`, or `DSH_CHECKOUT`.
