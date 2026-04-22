### 阶段 1：项目初始化

1. **创建项目目录** 并进入根目录。
2. 初始化 Git 仓库（命令：`git init`）。
3. 创建核心文件夹：
   - `memory-bank/`（存放所有核心文档，作为持久化上下文）
   - `docs/`（可选，用于规划、设计等额外文档）
   - `src/`（源代码目录，后续逐步填充）
4. **启动 Claude Code**：在终端执行 `claude` 进入交互会话。

### 阶段 2：需求与规划阶段

此阶段是整个项目的基石，必须**先完成再进入编码**。

**步骤顺序**（严格按此执行）：

1. **生成产品需求文档（PRD）或应用设计文档**
   - **提示示例**（在新会话中输入）：\
     “请帮我生成一份完整的 Markdown 格式产品需·求文档（PRD）。应用名称：\[您的应用名称]，一句话核心目标：\[例如：一个帮助用户记录每日习惯的移动端 Web 应用]。请包含：用户画像、核心功能列表、功能优先级、非功能需求（性能、安全等）、成功指标、潜在风险。输出为 `prd.md` 格式。”
   - **您的责任**：仔细审阅、修改、完善，确保与您的真实意图一致。补充细节并迭代直到满意。
   - **输出文件**：`memory-bank/prd.md`。
2. **生成技术栈推荐**
   - **您主动找 AI 生成**：是的。
   - **提示示例**：\
     “基于以上 `prd.md` 中的需求，请推荐最简单但最健壮的技术栈。优先考虑成熟、维护成本低、生态好的方案。包含前端/后端/数据库/部署等，并说明理由。输出为 `tech-stack.md`。”
   - **您的责任**：审阅并决定最终采用的技术栈（可小幅修改）。
   - **输出文件**：`memory-bank/tech-stack.md`。
3. **生成实施计划**
   - **提示示例**（必须同时喂入前两个文件）：\
     “请阅读 `memory-bank/prd.md` 和 `memory-bank/tech-stack.md`，生成详细的分步实施计划（implementation-plan.md）。要求：① 按优先级拆分成小而具体的步骤；② 每个步骤包含明确目标、验收标准、测试要点；③ **不要包含任何代码**；④ 强调模块化与接口先行。”
   - **您的责任**：审阅计划是否清晰、可执行，并回答 AI 提出的任何澄清问题。迭代完善计划。
   - **输出文件**：`memory-bank/implementation-plan.md`。

**此阶段喂给 Claude 的 Markdown 文件**：逐步喂入已生成的 `prd.md`、`tech-stack.md`（使用 `@memory-bank/prd.md` 等方式引用）。

### 阶段 3：AI 规则与架构设定（关键上下文固定）

1. **生成 CLAUDE.md（AI 行为规范文件）**
   - **您主动找 AI 生成**：部分生成，之后人工强化。
   - 在 Claude Code 会话中执行 `/init`，让它基于 `prd.md`、`tech-stack.md` 和 `implementation-plan.md` 自动生成或更新中文版 `CLAUDE.md`。
   - **您的责任**：打开 `CLAUDE.md`，补充或强化以下核心规则（参考 Vibe Coding 模板）：
     - 必须始终先阅读 `memory-bank/prd.md` 和 `memory-bank/architecture.md` 和 `memory-bank/progress.md` 后再写代码。
     - 一次只处理一个模块/功能。
     - 接口先行，模块化开发，禁止创建单体巨文件。
     - 每完成重大功能后，必须更新 `architecture.md` 和 `progress.md`。
     - 遵守奥卡姆剃刀原则、目的主导等。
   - **输出文件**：项目根目录 `CLAUDE.md`（此文件会作为每次会话的核心系统提示）。
2. **生成架构文档**
   - **提示示例**：\
     “请阅读所有 memory-bank 下的文件，生成项目架构文档（architecture.md），包含目录结构、每个模块/文件的职责、数据流、接口定义等。使用 Mermaid 图辅助说明。”
   - **您的责任**：审阅并确认架构合理。
   - **输出文件**：`memory-bank/architecture.md`。

**此阶段喂给 Claude 的 Markdown 文件**：`prd.md`、`tech-stack.md`、`implementation-plan.md`（全部放入 memory-bank 并通过 `@` 引用）。

### 阶段 4：编码实现阶段（迭代执行）

1. **按实施计划分步开发**
   - **每次新功能/步骤开始前**：
     - 执行 `/clear` 或 `/compact` 清理上下文。
     - 喂入必要文件：`@memory-bank/prd.md`、`@memory-bank/architecture.md`、`@memory-bank/implementation-plan.md` 以及当前步骤相关的规划。
     - 切换到 Plan 模式（根据步骤来定）。
   - **执行指令示例**：\
     “请基于 @memory-bank/implementation-plan.md 中的 \[步骤编号：如 Step 2.1] 进行开发, 任务完成后，请同步更新 @memory-bank/architecture.md（如有结构变动）和 @memory-bank/progress.md。必须遵守 CLAUDE.md 中的所有规则。”
   - **AI 生成**：代码、测试、文档更新。
   - **您的责任**：代码审查、运行测试、验证功能是否符合 PRD。测试通过后才允许进入下一步。
   - 每次完成一个步骤后：让 AI 更新 `memory-bank/progress.md` 和 `memory-bank/architecture.md`，然后 Git 提交。

### 阶段 5：收尾与维护

- 定期执行 `/context` 检查 token 使用，必要时 `/compact`。
- 所有新功能均创建独立的 `feature-implementation.md` 记录规划。
- 调试时只提供：预期行为 vs 实际行为 + 最小复现步骤。
- 项目完成后，更新 README.md 并整理文档。

### 总结

**推荐实践**：

- 将 `memory-bank/` 中的文件作为“黄金上下文”，每次启动会话时优先引用。
- 严格执行“一句话目标 + 非目标”描述，避免 AI 偏离。
- 人类只做审阅与决策，最大化利用 AI 生成能力。

