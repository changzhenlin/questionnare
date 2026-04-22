# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

轻量在线问卷工具，面向个人用户。支持创建问卷、分享链接回收答卷、查看统计结果。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) + TypeScript |
| UI / CSS | Tailwind CSS + shadcn/ui |
| 后端 | Next.js API Routes / Server Actions |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | Clerk |
| 图表 | Recharts |
| 表单校验 | Zod |
| 部署 | Vercel + Vercel Postgres |

## 常用命令

```bash
# 开发服务器
pnpm dev

# 数据库
pnpm prisma generate      # 生成 Prisma Client
pnpm prisma db push       # 将 Schema 同步到数据库
pnpm prisma studio        # 打开 Prisma Studio
pnpm prisma migrate dev   # 创建并应用迁移

# 构建与部署
pnpm build
pnpm start
```

## 项目结构（规划）

```
├── app/
│   ├── api/               # API 路由（问卷 CRUD、提交答卷）
│   ├── dashboard/         # 我的问卷列表（需登录）
│   ├── survey/
│   │   ├── [id]/          # 问卷填写页（公开访问）
│   │   ├── [id]/edit/     # 问卷编辑页
│   │   └── [id]/results/  # 数据统计页
│   └── layout.tsx
├── components/ui/         # shadcn/ui 组件
├── lib/
│   ├── prisma.ts          # Prisma Client 单例
│   └── validations.ts     # Zod Schema（前后端共用）
├── prisma/
│   └── schema.prisma      # 数据库模型定义
└── public/
```

## 架构原则

**接口先行**：先定义 Zod Schema 和 API 契约，前端可用 Mock 数据并行开发，接口就绪后直接替换。

**模块化边界**：
- 认证模块（Clerk）只消费 `userId`，不处理密码或 Token
- 数据校验模块（Zod）前后端共用同一套 Schema，接口层统一校验
- API 层每个资源（Survey、Response、Stats）独立路由文件
- 管理页（`/dashboard`、 `/survey/:id/edit`）与访客页（`/survey/:id`）完全分离，复用组件通过 props 传入差异配置

## 核心数据模型关系

- 问卷 `1:N` 题目、题目 `1:N` 选项
- 问卷 `1:N` 答卷、答卷 `1:N` 答案
- 删除问卷时级联删除其题目、选项、答卷、答案
- 用户表由 Clerk 管理，业务表通过 `userId`（字符串）关联

## 问卷状态流转

```
草稿 → 已发布 → 已结束
        ↑_________|
       （重新发布）
```

- 只有草稿问卷可发布（需至少一题）
- 已结束问卷不可直接编辑，但可重新发布
- 已结束或草稿问卷拒绝答卷提交

## 题型

- `SINGLE_CHOICE` — 单选（Radio）
- `MULTIPLE_CHOICE` — 多选（Checkbox）
- `TEXT` — 填空（Input / Textarea）

## 权限规则

- 所有写操作校验用户所有权，越权访问返回 403
- 统计接口仅问卷所有者可访问
- 问卷填写页公开访问，无需登录
