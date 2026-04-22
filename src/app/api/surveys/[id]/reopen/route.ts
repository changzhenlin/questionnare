import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/surveys/:id/reopen — 重新发布（已结束 → 已发布）
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

  if (survey.status !== "CLOSED") {
    return NextResponse.json(
      { error: "CONFLICT", message: "只有已结束问卷可以重新发布" },
      { status: 409 }
    );
  }

  const updated = await prisma.survey.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json(updated);
}
