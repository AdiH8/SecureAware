import { addDays } from "@/lib/date";
import { Assignment, AssignmentRule, Attempt, Scenario } from "@/lib/types";

export function shouldTriggerRule(params: {
  rule: AssignmentRule;
  attempt: Attempt;
  scenario: Scenario;
}): boolean {
  const { rule, attempt, scenario } = params;
  if (rule.category !== scenario.category) {
    return false;
  }
  if (rule.trigger === "WRONG_ANSWER" && !attempt.isCorrect) {
    return true;
  }
  if (rule.trigger === "HIGH_REACTION_RISK" && attempt.reactionRiskScore >= 70) {
    return true;
  }
  return false;
}

export function buildFollowUpAssignment(params: {
  organizationId: string;
  userId: string;
  rule: AssignmentRule;
  reason: string;
  now: Date;
}): Assignment {
  const { organizationId, userId, rule, reason, now } = params;
  return {
    id: `asg_${Math.random().toString(36).slice(2, 10)}`,
    organizationId,
    userId,
    moduleId: rule.moduleId,
    reason,
    status: "PENDING",
    createdAt: now.toISOString(),
    dueAt: addDays(now, rule.dueInDays).toISOString(),
    retestAt: addDays(now, rule.retestInDays).toISOString(),
    isArchived: false,
    archivedAt: null,
    updatedAt: now.toISOString(),
  };
}
