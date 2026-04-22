import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, Prisma } from "@/lib/prisma";
import { SurveyUpdateSchema } from "@/lib/validations";

// GET /api/surveys/:id — 公开访问（填写页使用），草稿/已结束仅所有者可见
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!survey) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // 草稿/已结束问卷仅所有者可见
  if (survey.status !== "PUBLISHED") {
    const { userId } = await auth();
    if (survey.userId !== userId) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  return NextResponse.json(survey);
}

// PUT /api/surveys/:id — 更新问卷（需所有权）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = SurveyUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { title, description, questions } = parsed.data;

  // 使用事务：更新基本信息 + 可选替换题目
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 更新问卷基本信息
    await tx.survey.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
    });

    // 如果传了 questions，替换所有题目
    if (questions !== undefined) {
      // 删除旧题目（级联删除选项）
      await tx.question.deleteMany({ where: { surveyId: id } });

      // 创建新题目和选项
      for (const q of questions) {
        const createdQuestion = await tx.question.create({
          data: {
            surveyId: id,
            text: q.text,
            type: q.type,
            order: q.order,
            required: q.required,
          },
        });

        if (q.options && q.options.length > 0) {
          await tx.option.createMany({
            data: q.options.map((o) => ({
              questionId: createdQuestion.id,
              text: o.text,
              order: o.order,
            })),
          });
        }
      }
    }
  });

  // 返回完整问卷
  const result = await prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  return NextResponse.json(result);
}

// DELETE /api/surveys/:id — 删除问卷（需所有权，级联删除）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.survey.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (existing.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  await prisma.survey.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
