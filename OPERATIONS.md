# 修改及 GitHub 部署说明

这份文档用于记录当前站点的日常维护流程，目标是两件事：

1. 修改主页和 Blog
2. 更新并部署到 GitHub Pages

## 🔧 配置

Frosti 使用 `frosti.config.yaml` 作为配置文件，您可以在此文件中配置网站的基本信息、导航栏、页脚等内容。

### 网站基本信息 (site)

```yaml
site:
  tab: Frosti # 浏览器标签栏上显示的文本
  title: Frosti # 网站的主标题
  description: A clean, elegant, and fast static blog template! # 网站描述，用于SEO
  language: en # 网站的语言代码，如"en"表示英文，"zh"表示中文
  favicon: /favicon.ico # 网站图标路径
```

### 主题设置 (theme)

```yaml
theme:
  light: winter # 浅色模式的主题，基于daisyUI的主题
  dark: dracula # 深色模式的主题，基于daisyUI的主题
  code: github-dark # 代码块的主题样式
```

- 主题基于 [daisyUI](https://daisyui.com/docs/themes/) 提供的主题选项
- 代码块主题使用 [Shiki](https://shiki.style/themes) 提供的样式

### 日期格式 (date_format)

```yaml
date_format: ddd MMM DD YYYY # 日期显示格式
```

### 菜单配置 (menu)

```yaml
menu:
  - id: home # 菜单项唯一标识符
    text: Home # 菜单显示的文本
    href: / # 链接地址
    svg: "material-symbols:home-outline-rounded" # 图标
    target: _self # 链接打开方式
```

每个菜单项包含以下属性：

- `id`: 唯一标识符
- `text`: 显示的文本
- `href`: 链接地址
- `svg`: 图标代码，使用 [Iconify](https://icon-sets.iconify.design/) 的图标集
- `target`: 链接打开方式(`_self`当前窗口或`_blank`新窗口)

#### 子菜单项 (subItems)

您可以通过添加 `subItems` 配置子菜单项，格式与主菜单项相同。

### 用户信息 (user)

```yaml
user:
  name: EveSunMaple # 用户名称
  site: "https://example.com" # 用户网站
  avatar: /profile.png # 用户头像
```

### 社交媒体配置 (social)

侧边栏和页脚可以配置不同的社交媒体链接：

```yaml
sidebar:
  social:
    - href: "https://github.com/username" # 链接地址
      ariaLabel: Github # 无障碍标签
      title: Github # 鼠标悬停时的提示
      svg: "ri:github-line" # 图标代码
```

### 图标设置 (icon)

Frosti 使用 [Iconify](https://icon-sets.iconify.design/) 作为图标库。您可以在其网站上搜索您喜欢的图标，然后复制图标的代码到配置文件中的 `svg` 字段。

### 语言设置 (language)

Frosti 支持多语言，通过以下方式配置：

1. 在 `frosti.config.yaml` 中设置网站默认语言：

```yaml
site:
  language: zh # 设置为 "zh" 使用中文，"en" 使用英文
```

2. 通过 `src/i18n/translations.yaml` 文件管理所有界面文本翻译：

```yaml
en: # 英文翻译
  label:
    noTag: No tags assigned
    tagCard: Tags
    # 其他英文标签...

zh: # 中文翻译
  label:
    noTag: 未分配标签
    tagCard: 标签
    # 其他中文标签...
```

#### 添加或修改翻译

要添加新的语言支持或修改现有翻译：

1. 在 `translations.yaml` 文件中添加新的语言代码和对应翻译，或修改现有翻译
2. 在 `frosti.config.yaml` 中更改 `site.language` 为您要使用的语言代码

## 🚀 自动更新

为了让您的项目与 Frosti 的最新版本保持同步，您可以使用我们提供的更新脚本。

```sh
bash frosti.update.sh
```

该脚本将：

1.  **克隆最新版本** 的 Frosti 仓库。
2.  **安全地更新** 您的项目文件，根据 `.updateignore` 文件添加和覆盖文件。
3.  **智能地删除** 官方仓库中已移除的文件，而不会影响您忽略的文件。
4.  **清理** 任何残留的空文件夹和临时文件。
5.  使用 `pnpm` **安装或更新** 依赖项。

## 本地预览

不要直接双击 `dist/index.html`。

正确做法是在项目根目录执行：

```bash
pnpm run search:index
pnpm run dev
```

然后打开：

```text
http://localhost:4321/
```

## 发布到 GitHub

当前部署方式是：

```text
push 到 main -> GitHub Actions 自动部署
```

标准发布流程：

```bash
pnpm run build
git status
git add .
git commit -m "Update homepage and blog"
git push -u --force origin main
```

推送后，GitHub 会自动执行：

```text
.github/workflows/deploy.yml
```

## GitHub Pages 必要设置

仓库里必须确认以下设置：

1. 打开 `Settings > Pages`
2. `Source` 选择 `GitHub Actions`
3. `Custom domain` 保持为空
4. 保存

如果这里配置不对，线上可能出现：

- 首页显示 README
- `/blog/` 404
- 整个站点不存在

## 如何检查部署是否成功

### 1. 查看 Actions

打开仓库 Actions 页面，确认 `Deploy to GitHub Pages` 成功。

### 2. 查看线上地址

检查以下地址：

- 首页：`https://goudomahan.github.io/`
- Blog 列表：`https://goudomahan.github.io/blog/`
- 文章详情：`https://goudomahan.github.io/blog/你的文章slug/`

## 如果部署没有更新

可以用空提交强制重新部署：

```bash
git commit --allow-empty -m "Trigger GitHub Pages redeploy"
git push origin main
```

## 常见问题

### 1. 本地页面白底、没样式

原因通常是你直接打开了 `dist/index.html`。

正确方式：

- `npm run dev`
- 或 `npm run preview`

### 2. 线上显示 README，不是主页

原因通常是 GitHub Pages 没切到 `GitHub Actions`。

### 3. Blog 文章没显示

检查以下几点：

- 文件是否放在 `src/content/posts/`
- `draft` 是否为 `false`
- frontmatter 是否符合 `src/content/config.ts` 的 schema

### 4. 推送时提示仓库已迁移

建议把远程地址改成新地址：

```bash
git remote set-url origin https://github.com/GoudoMahan/GoudoMahan.github.io.git
```

执行后确认：

```bash
git remote -v
```

## 推荐维护习惯

1. 修改主页前先运行 `npm run dev`
2. 每新增文章都先检查本地 `/blog/` 和文章详情页
3. 发布前一定运行一次 `npm run build`
4. 推送后检查一次 Actions
5. 线上异常时先查 Pages 设置，再查代码

## 其他

把你的背景图片重命名为 background.jpg 放到 public 文件夹，重新运行项目就能看到背景图片效果了。

