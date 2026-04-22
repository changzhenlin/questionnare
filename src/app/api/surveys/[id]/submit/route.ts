import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubmitSurveySchema } from "@/lib/validations";

// POST /api/surveys/:id/submit — 提交答卷（公开接口，无需登录）
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 查询问卷及题目、选项
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (survey.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "CONFLICT", message: "问卷未发布或已结束，无法提交" },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = SubmitSurveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { answers } = parsed.data;

  // 构建题目映射，方便校验
  const questionMap = new Map(survey.questions.map((q) => [q.id, q]));

  // 校验答案
  const errors: Array<{ questionId: string; message: string }> = [];

  for (const q of survey.questions) {
    const answer = answers.find((a) => a.questionId === q.id);

    // 必填校验
    if (q.required && !answer) {
      errors.push({ questionId: q.id, message: "必填题目未回答" });
      continue;
    }

    if (!answer) continue;

    // 根据题型校验答案格式
    if (q.type === "SINGLE_CHOICE") {
      if (!answer.optionId) {
        errors.push({ questionId: q.id, message: "单选题未选择选项" });
        continue;
      }
      const validOption = q.options.find((o) => o.id === answer.optionId);
      if (!validOption) {
        errors.push({ questionId: q.id, message: "单选题选项不合法" });
      }
    } else if (q.type === "MULTIPLE_CHOICE") {
      if (!answer.optionIds || answer.optionIds.length === 0) {
        errors.push({ questionId: q.id, message: "多选题未选择选项" });
        continue;
      }
      const validOptionIds = new Set(q.options.map((o) => o.id));
      for (const optionId of answer.optionIds) {
        if (!validOptionIds.has(optionId)) {
          errors.push({ questionId: q.id, message: "多选题包含不合法选项" });
          break;
        }
      }
    } else if (q.type === "TEXT") {
      if (!answer.textValue || answer.textValue.trim() === "") {
        errors.push({ questionId: q.id, message: "填空题答案不能为空" });
      }
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: errors },
      { status: 400 }
    );
  }

  // 使用事务创建 Response 和 Answer
  const response = await prisma.$transaction(async (tx) => {
    // 创建答卷
    const createdResponse = await tx.response.create({
      data: { surveyId: id },
    });

    // 创建答案记录
    const answerRecords = [];
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      if (question.type === "SINGLE_CHOICE" && answer.optionId) {
        answerRecords.push({
          responseId: createdResponse.id,
          questionId: answer.questionId,
          optionId: answer.optionId,
        });
      } else if (
        question.type === "MULTIPLE_CHOICE" &&
        answer.optionIds &&
        answer.optionIds.length > 0
      ) {
        for (const optionId of answer.optionIds) {
          answerRecords.push({
            responseId: createdResponse.id,
            questionId: answer.questionId,
            optionId,
          });
        }
      } else if (question.type === "TEXT" && answer.textValue) {
        answerRecords.push({
          responseId: createdResponse.id,
          questionId: answer.questionId,
          textValue: answer.textValue,
        });
      }
    }

    if (answerRecords.length > 0) {
      await tx.answer.createMany({ data: answerRecords });
    }

    return createdResponse;
  });

  return NextResponse.json(
    { responseId: response.id, message: "提交成功" },
    { status: 201 }
  );
}
