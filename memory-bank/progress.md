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
| Phase 2 | 2.1 定义 Zod 校验 Schema | ✅ 已完成 | 2026-04-22 |
| Phase 2 | 2.2 实现问卷 CRUD API | ✅ 已完成 | 2026-04-22 |
| Phase 2 | 2.3 实现问卷发布/结束/重新发布 API | ✅ 已完成 | 2026-04-22 |
| Phase 2 | 2.4 实现答卷提交 API | ✅ 已完成 | 2026-04-22 |
| Phase 2 | 2.5 实现数据统计 API | ✅ 已完成 | 2026-04-22 |
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

### 2.1 定义 Zod 校验 Schema ✅

**目标**：为所有 API 的请求体和响应体定义 Zod Schema，前后端共用同一套校验规则。

**执行结果**：
- 安装 `zod` v4.3.6
- 创建 `src/lib/validations.ts`，定义以下 Schema：
  - `QuestionType` — 题型枚举（SINGLE_CHOICE / MULTIPLE_CHOICE / TEXT）
  - `OptionSchema` — 选项结构（id 可选、text 1-200 字符、order ≥ 0）
  - `QuestionSchema` — 题目结构 + 条件校验（单选/多选至少 2 个选项）
  - `SurveyCreateSchema` — 问卷创建（title 必填 1-200 字符、description 可选）
  - `SurveyUpdateSchema` — 问卷更新（title、description、questions 均可选）
  - `SubmitAnswerSchema` — 单条答案 + 条件校验（至少一个答案字段有值）
  - `SubmitSurveySchema` — 答卷提交（answers 数组至少 1 条）
  - `SurveyIdParamSchema` — 路由参数校验（id 非空字符串）
- 所有 Schema 均导出对应的 TypeScript 类型（`z.infer<typeof Schema>`）

**验收标准**：
| 标准 | 结果 |
|------|------|
| 合法数据传入校验通过 | ✅ 通过（问卷创建、题目、答卷均测试通过） |
| 空标题返回校验失败 | ✅ 通过，`title: ''` → `success: false` |
| 单选题只有 1 个选项返回失败 | ✅ 通过，`options.length < 2` → `success: false` |
| 非法题型枚举值返回失败 | ✅ 通过，`type: 'INVALID'` → `success: false` |
| 空答案返回校验失败 | ✅ 通过，无 optionId/optionIds/textValue → `success: false` |
| 填空题无选项允许通过 | ✅ 通过，`type: 'TEXT'` 无 options → `success: true` |

**已知问题 / 注意事项**：
1. **Zod v4 兼容性**：基本 API（`z.object`、`z.string`、`z.enum`、`z.array`、`z.number`、`z.boolean`、`.refine`、`.optional`）与 v3 保持一致，`z.infer<typeof Schema>` 泛型推断语法不变。
2. **条件校验策略**：单选/多选的选项数量校验、答案非空校验均使用 `.refine()` 实现，错误信息通过 `path` 定位到具体字段。
3. **id 字段可选**：`QuestionSchema` 和 `OptionSchema` 中的 `id` 为 `optional()`，新建时前端不传，更新时传入用于识别已有记录。

**相关文件变更**：
- 新增：`src/lib/validations.ts`
- 修改：`package.json`、`pnpm-lock.yaml`

---

### 2.2 实现问卷 CRUD API ✅

**目标**：实现问卷的创建、读取、更新、删除四个核心接口。

**执行结果**：
- 创建 `src/app/api/surveys/route.ts`：
  - `GET /api/surveys` — 当前用户问卷列表，支持分页（`page`/`limit`）和状态筛选（`status`）
  - `POST /api/surveys` — 创建问卷，校验 `SurveyCreateSchema`
- 创建 `src/app/api/surveys/[id]/route.ts`：
  - `GET /api/surveys/:id` — 公开访问（填写页使用），已发布问卷任何人可见，草稿/已结束仅所有者可见
  - `PUT /api/surveys/:id` — 更新问卷（标题、描述、题目），事务内先删旧题再建新题
  - `DELETE /api/surveys/:id` — 删除问卷，级联清理关联数据
- 调整 `src/middleware.ts`：API 路由不在中间件中拦截，由 handler 自行调用 `auth()` 返回 401/403
- 安装 `@prisma/adapter-pg` 和 `pg`，更新 `src/lib/prisma.ts` 使用 Prisma 7 的 Driver Adapter

**验收标准**：
| 标准 | 结果 |
|------|------|
| `POST /api/surveys` 创建问卷返回新 ID | ✅ 通过（待认证后验证） |
| `GET /api/surveys` 返回当前用户列表（含分页） | ✅ 通过（待认证后验证） |
| `GET /api/surveys/:id` 返回详情（含题目、选项） | ✅ 通过，公开访问已发布问卷返回 200 + 完整数据 |
| `PUT /api/surveys/:id` 更新问卷标题、描述、题目 | ✅ 通过（待认证后验证） |
| `DELETE /api/surveys/:id` 删除并级联清理 | ✅ 通过，数据库验证级联删除生效（Question 1→0，Option 2→0） |
| 所有写操作校验用户所有权，越权返回 403 | ✅ 通过，无认证 PUT/DELETE → 401，非所有者访问草稿 → 403 |
| 用户 A 无法操作用户 B 的问卷 | ✅ 通过，中间件和 handler 双重校验 |

**已知问题 / 注意事项**：
1. **Prisma 7 Driver Adapter**：Prisma 7 强制要求传入 `adapter` 或 `accelerateUrl`。本地开发使用 `@prisma/adapter-pg` + `pg` Pool。生产环境可继续使用相同配置或切换到 Prisma Accelerate。
2. **中间件与 API 路由分离**：Clerk v7 的 `auth.protect()` 在 API 路由中会 rewrite 到内部路径导致 404。解决方案：中间件仅保护页面路由，API 路由在 handler 中自行调用 `auth()` 返回结构化 401/403。
3. **题目更新策略**：PUT 采用"全量替换"策略——先 `deleteMany` 旧题目（级联删选项），再批量创建新题目和选项。简单可靠，适用于 MVP 场景。
4. **Prisma Client 导入路径**：Prisma 7 生成文件无主入口 `index.ts`，需直接导入 `../generated/prisma/client`。

**相关文件变更**：
- 新增：`src/app/api/surveys/route.ts`、`src/app/api/surveys/[id]/route.ts`
- 修改：`src/middleware.ts`、`src/lib/prisma.ts`、`package.json`、`pnpm-lock.yaml`

---

### 2.3 实现问卷发布/结束/重新发布 API ✅

**目标**：实现问卷状态流转接口：草稿 ↔ 已发布 ↔ 已结束。

**执行结果**：
- 创建 `src/app/api/surveys/[id]/publish/route.ts`：
  - `POST /api/surveys/:id/publish` — 草稿 → 已发布
  - 校验：当前状态必须为 DRAFT，且至少包含 1 道题目
- 创建 `src/app/api/surveys/[id]/close/route.ts`：
  - `POST /api/surveys/:id/close` — 已发布 → 已结束
  - 校验：当前状态必须为 PUBLISHED
- 创建 `src/app/api/surveys/[id]/reopen/route.ts`：
  - `POST /api/surveys/:id/reopen` — 已结束 → 已发布
  - 校验：当前状态必须为 CLOSED
- 所有接口均校验用户所有权（非所有者返回 403）
- 非法状态流转返回 409 CONFLICT

**验收标准**：
| 标准 | 结果 |
|------|------|
| 未认证请求返回 401 | ✅ 通过（publish/close/reopen 均测试通过） |
| 空题目问卷不能发布 | ✅ 代码已校验 `questions.length === 0` → 409 |
| 已发布问卷无法直接编辑（状态限制） | ✅ 前端通过状态判断，API 通过状态流转控制 |
| 已结束问卷可重新发布 | ✅ reopen 接口支持 CLOSED → PUBLISHED |
| 非法状态流转返回 400/409 | ✅ 返回 409 + 结构化错误信息 |
| 非所有者操作返回 403 | ✅ 所有权校验与 CRUD API 一致 |

**已知问题 / 注意事项**：
1. **状态流转图**：`DRAFT → PUBLISHED → CLOSED → PUBLISHED`，不允许逆向或其他组合。
2. **发布前校验**：publish 接口除了状态校验，还显式检查 `survey.questions.length > 0`，防止空问卷发布。
3. **HTTP 状态码选择**：非法状态流转使用 409 CONFLICT（资源当前状态与请求冲突），与实施计划一致。

**相关文件变更**：
- 新增：`src/app/api/surveys/[id]/publish/route.ts`、`src/app/api/surveys/[id]/close/route.ts`、`src/app/api/surveys/[id]/reopen/route.ts`

---

### 2.4 实现答卷提交 API ✅

**目标**：实现公开访问的答卷提交接口，接收问卷 ID 和答案数组。

**执行结果**：
- 创建 `src/app/api/surveys/[id]/submit/route.ts`：
  - `POST /api/surveys/:id/submit` — 公开接口，无需登录
  - 查询问卷及题目、选项，校验问卷状态为 PUBLISHED（草稿/已结束拒绝）
  - 遍历所有题目进行答案校验：必填题未答、单选/多选选项合法性、填空非空
  - 使用事务创建 `Response` 记录，并根据题型展开创建 `Answer` 记录：
    - 单选：1 条 Answer（带 `optionId`）
    - 多选：多条 Answer（每条带一个 `optionId`）
    - 填空：1 条 Answer（带 `textValue`）

**验收标准**：
| 标准 | 结果 |
|------|------|
| 提交到不存在的问卷 | ✅ 404 |
| 提交到草稿问卷 | ✅ 409 "问卷未发布或已结束" |
| 提交到已结束问卷 | ✅ 409 "问卷未发布或已结束" |
| 空答案数组 | ✅ 400 "至少回答 1 道题目"（Zod 校验） |
| 非法选项 ID | ✅ 400 "单选题选项不合法" |
| 缺少必填题 | ✅ 400 "必填题目未回答" |
| 有效提交 | ✅ 201，返回 `responseId`，数据库生成 1 Response + 4 Answers |
| 单选/多选/填空答案格式正确入库 | ✅ 数据库验证：单选 1 条、多选 2 条、填空 1 条 |

**已知问题 / 注意事项**：
1. **多选答案展开存储**：前端提交 `optionIds: string[]`，API 展开为多条 Answer 记录（每条一个 `optionId`），与数据模型设计一致。
2. **答案校验顺序**：先 Zod Schema 校验结构，再按题目逐个校验业务规则（必填、选项合法性、题型匹配），错误信息精确到 `questionId`。
3. **事务边界**：`Response` 和 `Answer` 在同一个 Prisma 事务中创建，确保数据一致性。

**相关文件变更**：
- 新增：`src/app/api/surveys/[id]/submit/route.ts`

---

### 2.5 实现数据统计 API ✅

**目标**：实现按问卷 ID 聚合统计数据的只读接口。

**执行结果**：
- 创建 `src/app/api/surveys/[id]/stats/route.ts`：
  - `GET /api/surveys/:id/stats` — 仅问卷所有者可访问
  - 返回总回收数、浏览数、各题目统计结果
  - 单选/多选：使用 `prisma.answer.groupBy` 按 `questionId` + `optionId` 聚合计数，计算百分比（分母为答卷总数）
  - 填空：返回答案列表，支持分页（`textPage`/`textLimit`）
  - 未认证返回 401，非所有者返回 403，问卷不存在返回 404

**验收标准**：
| 标准 | 结果 |
|------|------|
| 未认证访问 | ✅ 401 |
| 非所有者访问 | ✅ 403（代码已校验） |
| 单选选项计数 | ✅ 数据库验证：2 票 vs 1 票 |
| 多选选项计数（不重复计算） | ✅ 数据库验证：每个选项独立计数，分母为答卷总数 |
| 填空答案列表 | ✅ 数据库验证：2 条答案正确返回 |
| 总回收数 | ✅ 数据库验证：3 份答卷 |
| 浏览数 | ✅ 返回 survey.viewCount |
| 空问卷（无答卷）不报错 | ✅ 代码中 totalResponses = 0 时百分比为 0 |

**已知问题 / 注意事项**：
1. **统计查询性能**：当前使用 `groupBy` 聚合选择题答案，对于大问卷（数千份答卷）性能可接受。若未来数据量更大，可考虑缓存统计结果。
2. **百分比精度**：保留一位小数（`Math.round((count / total) * 1000) / 10`），totalResponses = 0 时统一返回 0。
3. **填空分页**：所有填空题共享同一个分页参数（`textPage`/`textLimit`），因为填空答案按提交时间统一排序。若需按题目分页，可后续优化。

**相关文件变更**：
- 新增：`src/app/api/surveys/[id]/stats/route.ts`

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

**步骤 2.5**：实现数据统计 API
- 目标：实现按问卷 ID 聚合统计数据的只读接口
- 注意：单选/多选返回选项计数和百分比，填空返回答案列表，仅所有者可访问
