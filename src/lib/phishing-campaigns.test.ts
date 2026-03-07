import { beforeEach, describe, expect, it } from "vitest";

import {
  createAdminPhishingCampaign,
  listAdminPhishingCampaigns,
  listAdminUsers,
  listPhishingTemplates,
  resetStoreForTests,
  setAdminPhishingCampaignArchived,
  startAdminPhishingCampaign,
} from "@/lib/data/store";
import {
  buildMockCampaignMetrics,
  startCampaignLifecycle,
} from "@/lib/phishing-campaign-engine";

describe("phishing campaign engine", () => {
  it("returns deterministic and valid metrics", () => {
    const metrics = buildMockCampaignMetrics({
      campaignId: "phc_demo_1",
      recipientCount: 25,
    });

    expect(metrics.sentCount).toBe(25);
    expect(metrics.openedCount).toBeGreaterThanOrEqual(0);
    expect(metrics.openedCount).toBeLessThanOrEqual(25);
    expect(metrics.clickedCount).toBeLessThanOrEqual(metrics.openedCount);
    expect(metrics.reportedCount).toBeLessThanOrEqual(metrics.openedCount);
    expect(metrics.clickRate).toBeGreaterThanOrEqual(0);
    expect(metrics.reportRate).toBeGreaterThanOrEqual(0);
  });

  it("exposes the expected start lifecycle", () => {
    expect(startCampaignLifecycle()).toEqual(["QUEUED", "SENT", "COMPLETED"]);
  });
});

describe("phishing campaign store flow", () => {
  beforeEach(() => {
    resetStoreForTests();
  });

  it("targets active employees by department and completes campaign", async () => {
    const template = listPhishingTemplates()[0];
    const departmentId = "dept_finance";
    const expectedRecipients = listAdminUsers().filter(
      (user) => user.role === "EMPLOYEE" && user.departmentId === departmentId && !user.isArchived
    ).length;

    const campaign = await createAdminPhishingCampaign({
      name: "Фишинг тест - Финанси",
      templateId: template.id,
      subject: template.subject,
      senderName: template.senderName,
      content: template.content,
      departmentId,
    });

    const started = await startAdminPhishingCampaign(campaign.id);
    expect(started.status).toBe("COMPLETED");
    expect(started.metrics.sentCount).toBe(expectedRecipients);
    expect(started.startedAt).not.toBeNull();
    expect(started.completedAt).not.toBeNull();
  });

  it("archives campaign via soft-delete status", async () => {
    const template = listPhishingTemplates()[0];
    const campaign = await createAdminPhishingCampaign({
      name: "Архив тест",
      templateId: template.id,
      subject: template.subject,
      senderName: template.senderName,
      content: template.content,
      departmentId: "dept_sales",
    });

    const archived = await setAdminPhishingCampaignArchived(campaign.id, true);
    expect(archived.isArchived).toBe(true);
    expect(archived.status).toBe("ARCHIVED");

    const campaigns = await listAdminPhishingCampaigns();
    expect(campaigns.some((item) => item.id === campaign.id && item.isArchived)).toBe(true);
  });
});
