# 项目进度跟踪

> 本文件记录各实施步骤的完成状态、验收结果与已知问题。

---

## 实施计划总览

| 阶段 | 步骤 | 状态 | 完成时间 |
|------|------|------|----------|
| Phase 1 | 1.1 初始化 Next.js 15 项目 | ✅ 已完成 | 2026-04-22 |
| Phase 1 | 1.2 集成 shadcn/ui | ✅ 已完成 | 2026-04-22 |
| Phase 1 | 1.3 配置 Prisma 与数据库连接 | ✅ 已完成 | 2026-04-22 |
| Phase 1 | 1.4 设计数据库模型 | ✅ 已完成 | 2026-04-22 |
| Phase 1 | 1.5 集成 Clerk 认证 | ✅ 已完成 | 2026-04-22 |
| Phase 2 | 2.1 定义 Zod 校验 Schema | ⏳ 未开始 | — |
| Phase 2 | 2.2 实现问卷 CRUD API | ⏳ 未开始 | — |
| Phase 2 | 2.3 实现问卷发布/结束/重新发布 API | ⏳ 未开始 | — |
| Phase 2 | 2.4 实现答卷提交 API | ⏳ 未开始 | — |
| Phase 2 | 2.5 实现数据统计 API | ⏳ 未开始 | — |
| Phase 3 | 3.1 问卷列表页（Dashboard） | ⏳ 未开始 | — |
| Phase 3 | 3.2 问卷编辑器 — 题目增删改 | ⏳ 未开始 | — |
| Phase 3 | 3.3 问卷编辑器 — 题目排序 | ⏳ 未开始 | — |
| Phase 3 | 3.4 问卷发布与分享 | ⏳ 未开始 | — |
| Phase 4 | 4.1 问卷填写页 | ⏳ 未开始 | — |
| Phase 5 | 5.1 统计概览页 | ⏳ 未开始 | — |
| Phase 5 | 5.2 答卷详情列表 | ⏳ 未开始 | — |
| Phase 6 | 6.1 响应式适配 | ⏳ 未开始 | — |
| Phase 6 | 6.2 核心流程 E2E 测试 | ⏳ 未开始 | — |
| Phase 6 | 6.3 性能与安全基线检查 | ⏳ 未开始 | — |

---

## 步骤详情

### 1.1 初始化 Next.js 15 项目 ✅

**目标**：搭建 Next.js + TypeScript + Tailwind CSS 基础工程，确认开发环境就绪。

**执行结果**：
- 使用 `create-next-app@latest` 在临时目录初始化，然后同步到项目根目录
- 实际安装版本：Next.js 16.2.4、React 19.2.4、Tailwind CSS 4.2.4
- 默认启用 Turbopack 开发服务器
- 首页已替换为项目引导页（`/src/app/page.tsx`）

**验收标准**：
| 标准 | 结果 |
|------|------|
| `pnpm dev` 成功启动，首页无报错 | ✅ 通过，服务器 322ms 内 Ready |
| 热更新（HMR）正常工作 | ✅ 通过，修改 `page.tsx` 后浏览器内容实时更新 |
| 访问 `http://localhost:3000` 页面渲染正常 | ✅ 通过，curl 验证页面返回 "问卷调查平台" |

**已知问题 / 注意事项**：
1. **Next.js 版本差异**：`create-next-app@latest` 默认安装 Next.js 16（而非计划中的 15），但 API 兼容，无需降级
2. **Tailwind CSS v4**：不再使用 `tailwind.config.ts`，主题通过 `src/app/globals.css` 中的 `@theme inline` 定义。后续集成 shadcn/ui 时需注意 v4 的兼容方式
3. **目录非空初始化**：由于项目根目录已有 `.git`、`memory-bank/` 等文件，采用"临时目录初始化 + rsync 同步"的方式完成

**相关文件变更**：
- 新增：`package.json`、`pnpm-lock.yaml`、`tsconfig.json`、`next.config.ts`、`postcss.config.mjs`、`eslint.config.mjs`、`pnpm-workspace.yaml`、`.gitignore`
- 新增：`src/app/page.tsx`、`src/app/layout.tsx`、`src/app/globals.css`、`src/app/favicon.ico`
- 新增：`public/` 目录及静态资源
- 新增：`node_modules/` 依赖
- 修改：`memory-bank/architecture.md`（更新版本号与配置说明）

### 1.2 集成 shadcn/ui ✅

**目标**：初始化 shadcn/ui，安装 MVP 所需基础组件。

**执行结果**：
- 运行 `npx shadcn@latest init -d` 成功初始化，自动适配 Tailwind CSS v4
- 安装组件：Button、Input、Card、Dialog、Label、RadioGroup、Checkbox、Textarea
- 新增依赖：`@base-ui/react`、`class-variance-authority`、`clsx`、`lucide-react`、`tailwind-merge`、`tw-animate-css`
- 新增文件：`components.json`、`src/lib/utils.ts`、`src/components/ui/*.tsx`（8 个组件）
- `globals.css` 已更新为 shadcn/ui 主题变量（支持 light/dark 模式）

**验收标准**：
| 标准 | 结果 |
|------|------|
| 组件能正确渲染且样式一致 | ✅ 通过，测试页渲染所有 8 个组件无样式异常 |
| 无全局样式污染 | ✅ 通过，主题变量通过 CSS 自定义属性隔离 |
| 热更新正常工作 | ✅ 通过，修改组件文件后 HMR 正常 |

**已知问题 / 注意事项**：
1. **shadcn/ui v4 兼容**：当前 shadcn/ui 已支持 Tailwind CSS v4，初始化时自动检测到 v4 并正确配置。主题变量通过 `@theme inline` 和 CSS 自定义属性管理，无需 `tailwind.config.ts`。
2. **baseColor 为 neutral**：`components.json` 中 `baseColor` 自动设置为 `neutral`（灰度主题），与项目简约风格一致，无需调整。

### 1.4 设计数据库模型 ✅

**目标**：定义问卷（Survey）、题目（Question）、选项（Option）、答卷（Response）、答案（Answer）五张核心表的关系模型。

**执行结果**：
- 定义 2 个枚举类型：`SurveyStatus`（DRAFT/PUBLISHED/CLOSED）、`QuestionType`（SINGLE_CHOICE/MULTIPLE_CHOICE/TEXT）
- 定义 5 张核心表及关系：
  - `Survey`（问卷）→ 1:N `Question`（题目）
  - `Question` → 1:N `Option`（选项）
  - `Survey` → 1:N `Response`（答卷）
  - `Response` → 1:N `Answer`（答案）
  - `Question` → 1:N `Answer`
- 所有外键均配置 `onDelete: Cascade`，删除问卷时自动级联清理题目、选项、答卷、答案
- `userId` 为 `String` 类型，由 Clerk 管理，业务表不建外键约束
- 所有表均建立索引：按关联外键、状态等常用查询维度

**验收标准**：
| 标准 | 结果 |
|------|------|
| Schema 通过 `prisma validate` 无报错 | ✅ 通过 |
| 关系定义正确（1:N 关联） | ✅ 通过，Survey↔Question↔Option、Survey↔Response↔Answer 关系正确 |
| 删除问卷时级联删除关联数据 | ✅ 通过，数据库外键约束 `confdeltype = 'c'`（CASCADE）验证通过 |
| 用户表由 Clerk 管理，业务表通过 `userId` 关联 | ✅ 通过，`userId` 为 String 无 FK 约束 |

**已知问题 / 注意事项**：
1. **Answer 表设计**：单选填 `optionId`、多选生成多条记录各带 `optionId`、填空填 `textValue`。`optionId` 和 `textValue` 均可为空，业务层负责题型匹配校验。
2. **Question/Option 的 order 字段**：用于前端题目排序和选项排序，`@default(0)`，实际使用时由应用层按顺序赋值。
3. **Response.ipAddress**：可选字段，当前 Schema 已包含，后续如需防刷策略可直接使用。

**相关文件变更**：
- 重写：`prisma/schema.prisma`（从空模板替换为完整模型定义）
- 更新：`src/generated/prisma/`（Prisma Client 重新生成）

---

### 1.3 配置 Prisma 与数据库连接 ✅

**目标**：安装 Prisma CLI 与 Client，配置数据库连接。

**执行结果**：
- 安装依赖：`prisma`（dev）、`@prisma/client`（prod）
- 运行 `pnpm prisma init` 初始化，生成 `prisma/schema.prisma`、`prisma.config.ts`、`.env`
- 使用 Docker 启动本地 PostgreSQL 17 容器（`questionnaire-postgres`）作为开发数据库
- 配置 `DATABASE_URL="postgresql://questionnaire:questionnaire@localhost:5432/questionnaire"`
- 创建 Prisma Client 单例文件：`src/lib/prisma.ts`

**验收标准**：
| 标准 | 结果 |
|------|------|
| `prisma generate` 执行成功，生成类型安全的 Client | ✅ 通过，Client 生成至 `./src/generated/prisma` |
| `prisma db push` 能将 Schema 同步到数据库 | ✅ 通过，数据库连接正常，Schema 同步成功 |
| Prisma Studio 可连接数据库 | ✅ 通过，Studio 在 localhost:51212 正常响应（HTTP 200） |

**已知问题 / 注意事项**：
1. **Prisma 7 配置方式**：使用 `prisma.config.ts` 替代传统的 `schema.prisma` 中 `datasource` 的 `url = env("DATABASE_URL")` 写法，通过 `defineConfig` 集中管理配置。
2. **开发数据库**：当前使用 Docker 容器运行 PostgreSQL 17。生产环境应使用 Vercel Postgres 或同类托管服务，通过环境变量切换 `DATABASE_URL`。
3. **Prisma Client 输出路径**：generator 配置为 `output = "../src/generated/prisma"`，项目中通过 `import { PrismaClient } from "../generated/prisma"` 导入（相对路径），后续若调整目录结构需注意同步更新。

**相关文件变更**：
- 新增：`prisma/schema.prisma`、`prisma.config.ts`、`.env`、`src/lib/prisma.ts`
- 新增：`src/generated/prisma/`（Prisma Client 生成文件）
- 修改：`package.json`、`pnpm-lock.yaml`

---

### 1.5 集成 Clerk 认证 ✅

**目标**：配置 Clerk，实现注册、登录、登出、会话保护。

**执行结果**：
- 安装 `@clerk/nextjs` v7.2.3
- 配置 `ClerkProvider` 包裹根布局（`src/app/layout.tsx`）
- 创建 `src/middleware.ts`，使用 `clerkMiddleware` 保护 `/dashboard`、`/survey/:id/edit`、`/survey/:id/results` 及所有 API 写路由
- 创建登录页 `/sign-in` 和注册页 `/sign-up`（使用 `SignIn`/`SignUp` 组件，`routing="hash"`）
- 更新首页（`/page.tsx`）：使用 `auth()` 在服务端判断登录态，条件渲染「登录/注册」或「进入工作台」按钮
- 创建临时 Dashboard 页面用于验证路由保护

**验收标准**：
| 标准 | 结果 |
|------|------|
| 未登录用户访问管理页面被拦截 | ✅ 通过，`/dashboard` 返回 `x-clerk-auth-status: signed-out` + `protect-rewrite` |
| 登录页 `/sign-in` 正常加载 | ✅ 通过，HTTP 200 |
| 注册页 `/sign-up` 正常加载 | ✅ 通过，HTTP 200 |
| 首页根据登录态条件渲染 | ✅ 通过，服务端 `auth()` 获取 `userId` 判断 |

**已知问题 / 注意事项**：
1. **Clerk v7 API 变化**：`SignedIn`/`SignedOut` 组件不再从 `@clerk/nextjs` 主包导出。App Router 中推荐使用服务端 `auth()` 或客户端 `useAuth()` 判断登录态，替代方案更简洁。
2. **middleware.ts 位置**：Clerk v7 要求 `middleware.ts` 必须位于 `./src/middleware.ts`，放在根目录会报错。
3. **环境变量**：`.env` 中已配置 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 和 `CLERK_SECRET_KEY`。生产环境需在 Vercel Dashboard 中配置对应的环境变量。
4. **Dashboard 页面**：当前为临时验证页面，将在步骤 3.1 中替换为正式的问卷列表页。

**相关文件变更**：
- 新增：`src/middleware.ts`、`src/app/sign-in/[[...sign-in]]/page.tsx`、`src/app/sign-up/[[...sign-up]]/page.tsx`、`src/app/dashboard/page.tsx`
- 修改：`src/app/layout.tsx`（添加 ClerkProvider）、`src/app/page.tsx`（添加认证 UI）、`package.json`、`pnpm-lock.yaml`、`.env`

---

## 下一步行动

**步骤 2.1**：定义 Zod 校验 Schema
- 目标：为所有 API 的请求体和响应体定义 Zod Schema，前后端共用同一套校验规则
- 注意：覆盖问卷创建、更新、发布/结束、答卷提交的数据结构校验
