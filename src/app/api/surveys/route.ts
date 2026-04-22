import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SurveyCreateSchema } from "@/lib/validations";

// GET /api/surveys — 当前用户问卷列表（支持分页和状态筛选）
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const status = searchParams.get("status");

  const where = {
    userId,
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "CLOSED" } : {}),
  };

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.survey.count({ where }),
  ]);

  return NextResponse.json({
    data: surveys,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/surveys — 创建问卷
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = SurveyCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const survey = await prisma.survey.create({
    data: {
      ...parsed.data,
      userId,
    },
  });

  return NextResponse.json(survey, { status: 201 });
}
