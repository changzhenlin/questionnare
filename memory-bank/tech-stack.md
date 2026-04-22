## 整体架构

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | **Next.js 15** (App Router) | React 全栈框架，前后端同库，文件系统路由，内置 API 路由 |
| 语言 | **TypeScript** | 全链路类型安全，减少运行时错误 |
| UI / CSS | **Tailwind CSS** + **shadcn/ui** | 原子化样式 + 可复用 Headless 组件，无需额外 UI 库依赖 |
| 后端 | **Next.js API Routes / Server Actions** | 无需单独部署 Node 服务，降低运维复杂度 |
| 数据库 | **PostgreSQL** + **Prisma ORM** | 关系型数据完美契合问卷结构；Prisma 提供类型安全查询与自动迁移 |
| 认证 | **Clerk** | 免费版即可覆盖注册/登录/会话管理，比自研认证更省维护成本 |
| 图表 | **Recharts** | React 生态标准图表库，声明式 API，满足基础柱状图/饼图需求 |
| 表单校验 | **Zod** | TypeScript-first 校验，前后端共享 Schema |
| 部署 | **Vercel** + **Vercel Postgres** | Next.js 原生平台，零配置 CI/CD、自动 SSL、全球 CDN |


## 目录结构示例

```
├── app/
│   ├── api/               # API 路由（问卷 CRUD、提交答卷）
│   ├── dashboard/         # 我的问卷列表
│   ├── survey/
│   │   ├── [id]/          # 问卷填写页（公开访问）
│   │   ├── [id]/edit/     # 问卷编辑页
│   │   └── [id]/results/  # 数据统计页
│   └── layout.tsx
├── components/ui/         # shadcn/ui 组件
├── lib/
│   ├── prisma.ts          # Prisma Client 单例
│   └── validations.ts     # Zod Schema（问卷/题目/答卷校验）
├── prisma/
│   └── schema.prisma      # 数据库模型定义
└── public/
```

---

