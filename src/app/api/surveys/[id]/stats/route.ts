import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/surveys/:id/stats — 问卷统计（仅所有者可访问）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (survey.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  // 总回收数
  const totalResponses = await prisma.response.count({
    where: { surveyId: id },
  });

  // 获取填空题分页参数
  const { searchParams } = new URL(request.url);
  const textPage = Math.max(1, parseInt(searchParams.get("textPage") || "1", 10));
  const textLimit = Math.min(100, Math.max(1, parseInt(searchParams.get("textLimit") || "20", 10)));

  // 获取所有选择题（单选+多选）的 option 计数
  const choiceQuestionIds = survey.questions
    .filter((q) => q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE")
    .map((q) => q.id);

  const optionCounts =
    choiceQuestionIds.length > 0
      ? await prisma.answer.groupBy({
          by: ["questionId", "optionId"],
          where: {
            questionId: { in: choiceQuestionIds },
            optionId: { not: null },
          },
          _count: { optionId: true },
        })
      : [];

  // 构建 option 计数映射
  const countMap = new Map<string, number>();
  for (const oc of optionCounts) {
    if (oc.optionId) {
      const key = `${oc.questionId}:${oc.optionId}`;
      countMap.set(key, oc._count.optionId);
    }
  }

  // 获取填空答案（分页）
  const textQuestionIds = survey.questions
    .filter((q) => q.type === "TEXT")
    .map((q) => q.id);

  const textAnswers =
    textQuestionIds.length > 0
      ? await prisma.answer.findMany({
          where: {
            questionId: { in: textQuestionIds },
            textValue: { not: null },
          },
          include: { response: true },
          orderBy: { response: { submittedAt: "desc" } },
          skip: (textPage - 1) * textLimit,
          take: textLimit,
        })
      : [];

  const totalTextAnswers =
    textQuestionIds.length > 0
      ? await prisma.answer.count({
          where: {
            questionId: { in: textQuestionIds },
            textValue: { not: null },
          },
        })
      : 0;

  // 按 questionId 分组填空答案
  const textAnswersByQuestion = new Map<string, typeof textAnswers>();
  for (const ta of textAnswers) {
    const list = textAnswersByQuestion.get(ta.questionId) || [];
    list.push(ta);
    textAnswersByQuestion.set(ta.questionId, list);
  }

  // 构建返回结构
  const questions = survey.questions.map((q) => {
    const base = {
      questionId: q.id,
      questionText: q.text,
      type: q.type,
    };

    if (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") {
      const options = q.options.map((o) => {
        const count = countMap.get(`${q.id}:${o.id}`) || 0;
        const percentage =
          totalResponses > 0
            ? Math.round((count / totalResponses) * 1000) / 10
            : 0;
        return {
          optionId: o.id,
          text: o.text,
          count,
          percentage,
        };
      });
      return { ...base, options };
    }

    // TEXT
    const answers = (textAnswersByQuestion.get(q.id) || []).map((a) => ({
      responseId: a.responseId,
      textValue: a.textValue || "",
      submittedAt: a.response.submittedAt.toISOString(),
    }));
    return {
      ...base,
      textAnswers: answers,
      textPagination: {
        page: textPage,
        limit: textLimit,
        total: totalTextAnswers,
        totalPages: Math.ceil(totalTextAnswers / textLimit),
      },
    };
  });

  return NextResponse.json({
    surveyId: id,
    totalResponses,
    viewCount: survey.viewCount,
    questions,
  });
}
