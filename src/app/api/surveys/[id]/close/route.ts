import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/surveys/:id/close — 结束问卷（已发布 → 已结束）
export async function POST(
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

  if (survey.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "CONFLICT", message: "只有已发布问卷可以结束" },
      { status: 409 }
    );
  }

  const updated = await prisma.survey.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  return NextResponse.json(updated);
}
