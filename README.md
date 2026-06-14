# YUWEN 技术知识库

基于 Next.js 16 构建的个人技术博客系统，采用 Glassmorphism 视觉风格，支持 Markdown/MDX 编辑、代码高亮、Mermaid 图表、KaTeX 数学公式渲染。

> 嵌入式开发 · 芯片手册 · AI Agent · 前端工程 — 个人技术知识沉淀系统

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| 语言 | TypeScript 5 |
| 数据库 | MySQL + Prisma 7 ORM |
| 样式 | Tailwind CSS 4 + Glassmorphism |
| 编辑器 | MDX Editor |
| 渲染 | react-markdown + rehype-highlight + rehype-katex + mermaid |
| 安全 | JWT 认证 (jose) + rehype-sanitize + 违禁词过滤 (sensitive-word-tool) |
| 包管理 | pnpm |

## 功能特性

### 内容管理
- **MDX 编辑器** — 可视化 Markdown 编辑，支持实时预览（磨砂玻璃风格）
- **分类 & 标签** — 多层级分类体系 + 标签云
- **专栏/系列** — 将多篇文章组织为有序系列，支持上下篇导航、阅读进度追踪
- **照片专栏** — 上传分享专业美图，支持标签分类、网格画廊浏览、灯箱大图预览
- **草稿 & 定时发布** — 支持预设发布时间，到点自动上线（配合 Cron）
- **SEO 优化** — 自定义 SEO 标题/描述/OG 图片，自动生成 sitemap 和 RSS

### 阅读体验
- **暗色/亮色主题** — 手动切换或跟随系统，localStorage 持久化，无闪烁
- **代码高亮** — highlight.js 自动着色，支持多种语言
- **Mermaid 图表** — 流程图、时序图等内嵌渲染
- **KaTeX 数学公式** — 行内及块级 LaTeX 公式
- **文章目录** — 右侧悬浮 TOC，自动追踪当前位置
- **目录树导航** — 左侧分类目录树，浏览更方便

### 互动功能
- **评论系统** — 支持 Markdown、代码块高亮、嵌套回复、评论点赞
- **违禁词过滤** — DFA 高性能敏感词拦截，评论 + 昵称双字段检测
- **文章统计** — 浏览量、点赞数、评论数统计展示
- **内容安全** — Honeypot 反垃圾、IP 速率限制、评论审核

### 管理后台
- 文章 CRUD（新建/编辑/删除/软删除）
- 分类、标签、专栏、照片管理
- 评论审核（通过/拒绝/垃圾标记）
- 数据仪表盘（总浏览量/点赞数/评论数等聚合指标）
- 图片上传

## 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 9
- MySQL >= 8.0

### 安装

```bash
git clone <repo-url>
cd my_blog/mylog
pnpm install
```

### 环境变量

复制 `.env.example` 为 `.env` 并填写：

```env
DATABASE_URL="mysql://user:password@localhost:3306/mylog"
JWT_SECRET="your-jwt-secret-key"
ADMIN_INITIAL_PASSWORD="admin123"
CRON_SECRET="your-cron-secret-for-scheduled-publishing"
```

### 数据库初始化

```bash
# 推送 schema 到数据库（保留数据）
pnpm db:push

# 或使用迁移（开发环境）
pnpm db:migrate

# 生成 Prisma Client
pnpm db:generate

# 填充初始数据
pnpm db:seed
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)，后台管理入口 `/admin`。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
mylog/
├── app/                      # Next.js App Router 页面
│   ├── admin/                # 管理后台（仪表盘/文章/分类/标签/专栏/评论）
│   ├── api/                  # API 路由
│   │   ├── admin/            # 后台管理 API
│   │   ├── articles/         # 文章公开 API
│   │   ├── auth/             # 认证 API
│   │   ├── comments/         # 评论 API
│   │   ├── cron/             # 定时任务（发布调度）
│   │   ├── search/           # 搜索 API
│   │   └── series/           # 专栏公开 API
│   ├── categories/           # 分类页面
│   ├── posts/[slug]/         # 文章详情页
│   ├── photos/               # 照片展示页
│   ├── search/               # 搜索页面
│   ├── series/               # 专栏列表/详情页
│   └── tags/                 # 标签页面
├── components/               # React 组件
│   ├── effects/              # 视觉效果（GlobalGlow/MouseGlow）
│   ├── glass/                # Glassmorphism 容器组件
│   ├── home/                 # 首页组件（Hero/TopicCloud）
│   ├── markdown/             # Markdown 渲染相关
│   └── CommentSection.tsx    # 评论组件
├── lib/                      # 业务逻辑层
│   ├── db/                   # 数据库查询函数
│   ├── auth.ts               # JWT 认证
│   ├── prisma.ts             # Prisma 客户端
│   └── sensitive-words.ts    # 违禁词过滤
├── prisma/                   # 数据库 Schema & 迁移
│   └── schema.prisma
├── middleware.ts              # 路由守卫（后台认证）
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 定时任务配置

定时发布依赖 Cron 定时调用 `/api/cron/publish?secret=YOUR_CRON_SECRET`：

```bash
# 每 1 分钟检查一次
*/1 * * * * curl -s "https://your-domain.com/api/cron/publish?secret=${CRON_SECRET}"
```

Vercel 用户可使用 [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) 直接配置。

## Docker 部署

项目包含 `Dockerfile` 和 `docker-compose.yml`，可直接构建运行：

```bash
docker compose up -d
```

## License

MIT
