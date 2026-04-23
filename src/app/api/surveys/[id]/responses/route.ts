import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/surveys/:id/responses — 答卷列表（仅所有者可访问）
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const survey = await prisma.survey.findUnique({ where: { id } });
  if (!survey) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (survey.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

  // 获取该问卷的所有选项，用于映射 optionId -> text
  const allOptions = await prisma.option.findMany({
    where: { question: { surveyId: id } },
    select: { id: true, text: true },
  });
  const optionTextMap = new Map(allOptions.map((o) => [o.id, o.text]));

  const [responses, total] = await Promise.all([
    prisma.response.findMany({
      where: { surveyId: id },
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        answers: {
          include: {
            question: true,
          },
          orderBy: { question: { order: "asc" } },
        },
      },
    }),
    prisma.response.count({ where: { surveyId: id } }),
  ]);

  const data = responses.map((r) => ({
    id: r.id,
    submittedAt: r.submittedAt.toISOString(),
    ipAddress: r.ipAddress,
    answers: r.answers.map((a) => ({
      questionId: a.questionId,
      questionText: a.question.text,
      questionType: a.question.type,
      optionId: a.optionId,
      optionText: a.optionId ? optionTextMap.get(a.optionId) || null : null,
      textValue: a.textValue,
    })),
  }));

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
