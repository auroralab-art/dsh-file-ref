# dsh-file-ref

把本地文件粘贴或拖入 DeepSeek Harness 对话栏。插件插入一条 agent 可用现有工具打开的路径，不把文件字节上传给模型。

[English](README.md) | 中文

## 插入规则

| 文件位置 | 草稿文本 |
|---|---|
| 当前工作区内 | `@docs/spec.pdf` |
| 工作区外原路径 | `/Users/you/Downloads/spec.pdf` |
| 浏览器藏了路径 | `@.dsh-inbox/spec.pdf`（副本写入工作区） |
| PNG / JPEG / WebP / GIF | 官方图片轨，不改 |

发送后 Host 会确认每个 `@相对路径` 仍在工作区内，并注入：

```xml
<workspace-reference path="docs/spec.pdf" kind="file" />
```

工作区外的绝对路径保持原文。agent 按当前会话的访问模式去读。

## 安装

```sh
git clone https://github.com/auroralab-art/dsh-file-ref.git
cd dsh-file-ref
pnpm install && pnpm run build
dsh plugin --profile web add "$PWD"
```

重启 `dsh web` 并硬刷新浏览器。

## 开发

```sh
pnpm install
pnpm test
pnpm run build
```

设计说明见 [docs/design.md](docs/design.md)。
