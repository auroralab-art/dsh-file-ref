# dsh-file-ref

[English](README.md) | 中文

把本地文件粘贴或拖入 DeepSeek Harness 对话栏。插件插入一条 agent 可用现有工具打开的路径，不把文件字节上传给模型。

## 作用

| 文件位置 | 草稿文本 |
|---|---|
| 当前工作区内 | `@docs/spec.pdf` |
| 工作区外原路径 | `/Users/you/Downloads/spec.pdf` |
| 浏览器藏了路径 | `@.dsh-inbox/spec.pdf`（副本写入工作区） |
| PNG / JPEG / WebP / GIF | 官方图片轨，不改 |

发送前，Host 会确认每个 `@相对路径` 仍在工作区内，并注入：

```xml
<workspace-reference path="docs/spec.pdf" kind="file" />
```

工作区外的绝对路径保持原文。agent 按当前会话已有的工具和访问模式去读。

## 增强了什么

没有本插件时，对话栏只收 PNG、JPEG、WebP、GIF，其它文件会按「不支持的图片格式」拒绝。

`dsh-file-ref` 为这些文件补上路径引用：

- 浏览器或 Host 能解析到原路径时，引用原件。
- 否则在工作区 inbox 落一份副本，再 `@` 这条路径。
- 在模型步进前给 `@相对路径` 打存在性标记，agent 用会话里已有的 `read`、shell 等工具打开，不新增上传接口，也不新增模型侧文件工具。

## 安装

```sh
git clone https://github.com/auroralab-art/dsh-file-ref.git
cd dsh-file-ref
pnpm install && pnpm run build
dsh plugin --profile web add "$PWD"
```

重启 `dsh web` 并硬刷新浏览器。

可选配置（`inboxDir`、`maxStageBytes`）写在 `cordis.patch.yml` 对应行上。

## Aurora Lab

本插件由 [Aurora Lab](https://github.com/auroralab-art) 发布。我们正在开发一组 DSH 增强插件，用来丰富 DeepSeek Harness 的功能。

## 许可

不是 MIT。全文见 [LICENSE](LICENSE)（[中文](LICENSE.zh.md)）。

允许为个人、非商业目的自由下载和安装。任何修改或二创须事先联系所有者。商业使用须获得所有者书面同意。请通过 [auroralab-art](https://github.com/auroralab-art) 联系。

## 开发

```sh
pnpm install
pnpm test
pnpm run build
```
