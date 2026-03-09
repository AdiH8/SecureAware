import { beforeEach, describe, expect, it } from "vitest";

import {
  listAdminPhishingCampaigns,
  listAdminUsers,
  listDemoUsersByRole,
  listLearningAuditRows,
  resetStoreForTests,
} from "@/lib/data/store";

describe("seed integrity", () => {
  beforeEach(() => {
    resetStoreForTests();
  });

  it("has exactly 10 active employees with 4/3/3 department distribution", () => {
    const users = listAdminUsers();
    const activeEmployees = users.filter((user) => user.role === "EMPLOYEE" && !user.isArchived);

    expect(activeEmployees).toHaveLength(10);

    const counts = activeEmployees.reduce<Record<string, number>>((acc, user) => {
      acc[user.departmentId] = (acc[user.departmentId] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts.dept_sales).toBe(4);
    expect(counts.dept_finance).toBe(3);
    expect(counts.dept_hr).toBe(3);

    const admins = listDemoUsersByRole("ADMIN");
    expect(admins.some((user) => !user.isArchived)).toBe(true);
    expect(users.filter((user) => user.role === "MANAGER" && !user.isArchived)).toHaveLength(3);
  });

  it("covers all learning statuses and includes retake-heavy rows", async () => {
    const rows = await listLearningAuditRows();
    const statuses = new Set(rows.map((row) => row.status));

    expect(statuses.has("NOT_STARTED")).toBe(true);
    expect(statuses.has("IN_PROGRESS")).toBe(true);
    expect(statuses.has("READY_FOR_TEST")).toBe(true);
    expect(statuses.has("COMPLETED")).toBe(true);
    expect(rows.some((row) => row.retakeCount > 1)).toBe(true);
  });

  it("contains at least five seeded phishing campaigns with required statuses", async () => {
    const campaigns = await listAdminPhishingCampaigns();
    const statuses = new Set(campaigns.map((campaign) => campaign.status));

    expect(campaigns.length).toBeGreaterThanOrEqual(5);
    expect(statuses.has("DRAFT")).toBe(true);
    expect(statuses.has("SENT")).toBe(true);
    expect(statuses.has("COMPLETED")).toBe(true);
    expect(statuses.has("ARCHIVED")).toBe(true);

    campaigns.forEach((campaign) => {
      expect(campaign.metrics.sentCount).toBeGreaterThanOrEqual(campaign.metrics.clickedCount);
      expect(campaign.metrics.sentCount).toBeGreaterThanOrEqual(campaign.metrics.reportedCount);
    });
  });
});
