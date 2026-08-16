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

工作区外的绝对路径保持原文。插件不打开文件，也不上传字节。agent 按当前会话已有的工具和访问模式去读。

## 增强了什么

没有本插件时，对话栏只收 PNG、JPEG、WebP、GIF，其它文件会按「不支持的图片格式」拒绝。

`dsh-file-ref` 为这些文件补上路径引用：

- 浏览器或 Host 能解析到原路径时，引用原件。
- 否则在工作区 inbox 落一份副本，再 `@` 这条路径。
- 在模型步进前给 `@相对路径` 打存在性标记，agent 用会话里已有的 `read`、shell 等工具打开，不新增上传接口，也不新增模型侧文件工具。

## 安装或更新

需要本机已安装 `dsh` CLI，并使用 `web` profile。

```sh
dsh plugin --profile web add https://github.com/auroralab-art/dsh-file-ref/releases/download/v0.1.0/dsh-file-ref-0.1.0.tgz
```

已有安装也使用这条命令更新。然后重启 `dsh web` 并硬刷新浏览器，让 Host 和客户端都加载 `0.1.0`。

```sh
dsh plugin --profile web remove dsh-file-ref
```

## 配置

可选配置写在 `~/.dsh/profiles/web/cordis.patch.yml`。后一层会整段替换 `config`，改一项时请把要用的键都写上。

```yaml
- id: dsh-file-ref
  config:
    inboxDir: .dsh-inbox
    maxStageBytes: 20971520
```

- `inboxDir` — 浏览器藏了原路径时，副本落到工作区的相对目录，默认 `.dsh-inbox`。
- `maxStageBytes` — 单份副本大小上限，默认 `20971520`（20 MiB）。

## 路径处理

- PNG、JPEG、WebP、GIF 的粘贴和拖放仍走官方图片轨。
- 工作区内路径插入为 `@相对路径`。工作区外路径插入为绝对路径原文。
- 浏览器不给出文件系统路径时，Host 在 `inboxDir` 下写入副本，草稿再 `@` 该相对路径。
- 只有仍位于工作区内的 `@相对路径` 会生成引用标记。
- 绝对路径保持原文，插件不会改写成 mention。
- 文件格式不改变这条路径。inbox 副本受 `maxStageBytes` 限制。
- DSH 的 `read` 打开 UTF-8 文本。其它格式走会话中的 shell 或其它工具。

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
dsh plugin --profile web add "$PWD"
```

`add "$PWD"` 把当前检出链进 profile，目录必须留着。这是开发方式，不是给其它机器的安装命令。

构建需要 DeepSeek Harness 检出：默认 `../../deepseek-harness`，或设置 `DSH_CHECKOUT`。
