<!--
  dsh-file-ref: DeepSeek Harness 文件附件插件
  关键词: DeepSeek Harness 插件, DSH 插件, 拖拽文件, 粘贴文件,
  本地文件附件, 工作区引用, AI agent 文件访问, dsh-file-ref, Aurora Lab
-->

<div align="center">

# dsh-file-ref

**为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 添加文件附件能力。**

[![版本](https://img.shields.io/badge/版本-0.1.0-blue)](https://github.com/auroralab-art/dsh-file-ref/releases)
[![许可](https://img.shields.io/badge/许可-Aurora%20Lab%20Source-orange)](LICENSE)
[![DSH](https://img.shields.io/badge/DSH-v0.1.0--rc.1+-green)](https://github.com/deepseek-ai/deepseek-harness)

[English](README.md) | 中文

</div>

---

把本地文件拖入或粘贴到 DSH 对话栏 — PDF、CSV、代码、文档均可。插件解析文件系统路径，插入一条 `@workspace` 引用，agent 用现有工具打开即可。不上传字节，不增加模型上下文。

## 为什么需要这个插件？

没有本插件时，DSH 对话栏**只接受 PNG、JPEG、WebP、GIF**。其它文件会被当作「不支持的图片格式」拒绝。

`dsh-file-ref` 为任意文件补上路径引用：

- 浏览器或 Host 能解析到原路径时，引用原件。
- 否则在工作区 inbox 落一份副本，再 `@` 这条路径。
- 在模型步进前给 `@相对路径` 打存在性标记，agent 用会话里已有的 `read`、shell 等工具打开。

不新增上传接口，不新增模型侧文件工具。agent 用当前会话已有的访问模式读取文件。

## 快速开始

需要本机已安装 `dsh` CLI，并使用 `web` profile。

```sh
dsh plugin --profile web add https://github.com/auroralab-art/dsh-file-ref/releases/download/v0.1.0/dsh-file-ref-0.1.0.tgz
```

重启 `dsh web` 并硬刷新浏览器，完成。

卸载：

```sh
dsh plugin --profile web remove dsh-file-ref
```

## 工作原理

| 文件位置 | 插入到草稿的文本 |
|---|---|
| 当前工作区内 | `@docs/spec.pdf` |
| 工作区外原路径 | `/Users/you/Downloads/spec.pdf` |
| 浏览器藏了路径 | `@.dsh-inbox/spec.pdf`（副本写入工作区） |
| PNG / JPEG / WebP / GIF | 官方图片轨，不改 |

发送前，Host 确认每个 `@相对路径` 仍在工作区内，并注入：

```xml
<workspace-reference path="docs/spec.pdf" kind="file" />
```

工作区外的绝对路径保持原文。插件不打开文件，也不上传字节。agent 按当前会话的工具和访问模式去读取。

## 路径解析规则

- PNG、JPEG、WebP、GIF 的粘贴和拖放仍走官方图片轨。
- 工作区内路径插入为 `@相对路径`。工作区外路径插入为绝对路径原文。
- 浏览器不给出文件系统路径时，Host 在 `inboxDir` 下写入副本，草稿再 `@` 该相对路径。
- 只有仍位于工作区内的 `@相对路径` 会生成引用标记。
- 绝对路径保持原文，插件不会改写成 mention。
- 文件格式不改变这条路径。inbox 副本受 `maxStageBytes` 限制。
- DSH 的 `read` 打开 UTF-8 文本。其它格式走会话中的 shell 或其它工具。

## 配置

可选配置写在 `~/.dsh/profiles/web/cordis.patch.yml`。后一层会整段替换 `config`，改一项时请把要用的键都写上。

```yaml
- id: dsh-file-ref
  config:
    inboxDir: .dsh-inbox
    maxStageBytes: 20971520
```

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `inboxDir` | `.dsh-inbox` | 浏览器藏了原路径时，副本落到工作区的相对目录 |
| `maxStageBytes` | `20971520`（20 MiB） | 单份副本大小上限 |

## 常见问题

<details>
<summary><strong>这个插件会把文件上传给模型吗？</strong></summary>

不会。插件只在草稿文本中插入一条 *路径*。agent 用会话已有的工具（`read`、shell 等）打开文件。文件字节不会通过本插件发送到 LLM 上下文。
</details>

<details>
<summary><strong>支持哪些文件格式？</strong></summary>

除 PNG、JPEG、WebP、GIF（走内置图片轨）外的所有格式。常见用途包括 PDF、CSV、JSON、YAML、源代码、Markdown 和任何文本文档。
</details>

<details>
<summary><strong>能在 headless 模式下使用吗？</strong></summary>

不能。本插件仅面向 `web` profile，依赖浏览器粘贴/拖放事件和对话栏 UI。
</details>

<details>
<summary><strong>大文件怎么处理？</strong></summary>

写入 inbox 的副本受 `maxStageBytes`（默认 20 MiB）限制。agent 读取文件时还受会话自身工具的限制。
</details>

<details>
<summary><strong>需要哪个版本的 DSH？</strong></summary>

在 DeepSeek Harness `v0.1.0-rc.1` 及更新版本上测试通过。DSH 预览版的插件契约可能变动 — 建议锁定你测试使用的版本。
</details>

## 兼容性

| 依赖 | 版本 |
|---|---|
| DeepSeek Harness | `v0.1.0-rc.1`+ |
| Node.js | `^22.19.0` 或 `>=24.0.0` |
| Profile | `web` |

## Aurora Lab

本插件由 [Aurora Lab](https://github.com/auroralab-art) 发布。我们构建 DeepSeek Harness 增强插件。

**Aurora Lab 其他插件：**

- [dsh-access](https://github.com/auroralab-art/dsh-access) — 远程访问网关，角色令牌 + 单设备绑定
- [dsh-msg-revise](https://github.com/auroralab-art/dsh-msg-revise) — agent 停止后编辑并重新发送消息

## 许可

不是 MIT。全文见 [LICENSE](LICENSE)（[中文](LICENSE.zh.md)）。

允许为个人、非商业目的自由下载和安装。任何修改或二创须事先联系所有者。商业使用须获得所有者书面同意。请通过 [auroralab-art](https://github.com/auroralab-art) 联系。

## 开发

```sh
pnpm install
pnpm test
pnpm run build
dsh plugin --profile web add "$PWD"
```

`add "$PWD"` 把当前检出链进 profile，目录必须留着。这是开发方式，不是给其它机器的安装命令。

构建需要 DeepSeek Harness 检出：默认 `../../deepseek-harness`，或设置 `DSH_CHECKOUT`。
