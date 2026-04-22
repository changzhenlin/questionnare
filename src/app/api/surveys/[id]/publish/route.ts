import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/surveys/:id/publish — 发布问卷（草稿 → 已发布）
export async function POST(
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
    include: { questions: true },
  });

  if (!survey) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (survey.userId !== userId) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (survey.status !== "DRAFT") {
    return NextResponse.json(
      { error: "CONFLICT", message: "只有草稿问卷可以发布" },
      { status: 409 }
    );
  }

  if (survey.questions.length === 0) {
    return NextResponse.json(
      { error: "CONFLICT", message: "发布前至少包含 1 道题目" },
      { status: 409 }
    );
  }

  const updated = await prisma.survey.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json(updated);
}
