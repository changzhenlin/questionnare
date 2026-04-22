import { z } from "zod";

// ========== 枚举类型 ==========

export const QuestionType = z.enum([
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "TEXT",
]);

export type QuestionType = z.infer<typeof QuestionType>;

// ========== 选项 ==========

export const OptionSchema = z.object({
  id: z.string().optional(), // 新建无 id，更新有 id
  text: z.string().min(1, "选项文本不能为空").max(200, "选项文本最多 200 字符"),
  order: z.number().int().min(0, "顺序不能为负数"),
});

export type OptionInput = z.infer<typeof OptionSchema>;

// ========== 题目 ==========

export const QuestionSchema = z
  .object({
    id: z.string().optional(), // 新建无 id，更新有 id
    text: z.string().min(1, "题目文本不能为空").max(500, "题目文本最多 500 字符"),
    type: QuestionType,
    order: z.number().int().min(0, "顺序不能为负数"),
    required: z.boolean().default(false),
    options: z.array(OptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (
        (data.type === "SINGLE_CHOICE" || data.type === "MULTIPLE_CHOICE") &&
        (!data.options || data.options.length < 2)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "单选/多选题至少包含 2 个选项",
      path: ["options"],
    }
  );

export type QuestionInput = z.infer<typeof QuestionSchema>;

// ========== 问卷创建 ==========

export const SurveyCreateSchema = z.object({
  title: z
    .string()
    .min(1, "问卷标题不能为空")
    .max(200, "问卷标题最多 200 字符"),
  description: z
    .string()
    .max(1000, "问卷描述最多 1000 字符")
    .optional(),
});

export type SurveyCreateInput = z.infer<typeof SurveyCreateSchema>;

// ========== 问卷更新 ==========

export const SurveyUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "问卷标题不能为空")
    .max(200, "问卷标题最多 200 字符")
    .optional(),
  description: z
    .string()
    .max(1000, "问卷描述最多 1000 字符")
    .optional(),
  questions: z
    .array(QuestionSchema)
    .min(1, "发布前至少包含 1 道题目")
    .optional(),
});

export type SurveyUpdateInput = z.infer<typeof SurveyUpdateSchema>;

// ========== 答卷提交 ==========

export const SubmitAnswerSchema = z
  .object({
    questionId: z.string().min(1, "题目 ID 不能为空"),
    optionId: z.string().optional(), // 单选用
    optionIds: z.array(z.string()).optional(), // 多选用
    textValue: z.string().optional(), // 填空用
  })
  .refine(
    (data) => {
      // 至少有一个答案字段被填充
      const hasOptionId = data.optionId !== undefined && data.optionId !== "";
      const hasOptionIds =
        data.optionIds !== undefined && data.optionIds.length > 0;
      const hasTextValue =
        data.textValue !== undefined && data.textValue !== "";
      return hasOptionId || hasOptionIds || hasTextValue;
    },
    {
      message: "答案不能为空",
      path: ["optionId"],
    }
  );

export type SubmitAnswerInput = z.infer<typeof SubmitAnswerSchema>;

export const SubmitSurveySchema = z.object({
  answers: z.array(SubmitAnswerSchema).min(1, "至少回答 1 道题目"),
});

export type SubmitSurveyInput = z.infer<typeof SubmitSurveySchema>;

// ========== 辅助类型 ==========

export const SurveyIdParamSchema = z.object({
  id: z.string().min(1, "问卷 ID 不能为空"),
});

export type SurveyIdParam = z.infer<typeof SurveyIdParamSchema>;
