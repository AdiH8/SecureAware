import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { AUTH_COOKIES } from "@/lib/auth";
import { recordAttempt } from "@/lib/data/store";
import { AttemptResult, Role } from "@/lib/types";

const requestSchema = z.object({
  scenarioId: z.string().min(2),
  selectedOptionId: z.string().min(2).nullable(),
  responseTimeMs: z.number().int().min(0).max(120_000),
});

export async function POST(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIES.role)?.value as Role | undefined;
  const userId = request.cookies.get(AUTH_COOKIES.userId)?.value;
  if (!role || !userId) {
    return NextResponse.json({ error: "Нямате достъп" }, { status: 401 });
  }
  if (role !== "EMPLOYEE") {
    return NextResponse.json({ error: "Само служители могат да изпращат опити" }, { status: 403 });
  }

  const payload = requestSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const recorded = await recordAttempt({
    actorUserId: userId,
    input: payload.data,
  });

  const response: AttemptResult = {
    knowledgeScore: recorded.attempt.knowledgeScore,
    reactionRiskScore: recorded.attempt.reactionRiskScore,
    behavioralRisk: recorded.attempt.behavioralRisk,
    explanation: recorded.explanation,
    followUpAssigned: recorded.followUpAssigned,
  };

  return NextResponse.json(response);
}
