import { beforeEach, describe, expect, it } from "vitest";

import {
  createAdminPhishingCampaign,
  getManagerDashboardMetricsV2,
  getManagerDepartmentMetricsV2,
  listAdminPhishingCampaigns,
  listAdminUsers,
  listPhishingTemplates,
  resetStoreForTests,
  setAdminPhishingCampaignArchived,
  startAdminPhishingCampaign,
} from "@/lib/data/store";
import {
  buildCampaignMetricsFromActions,
  buildMockCampaignAction,
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

  it("builds deterministic user action for a campaign", () => {
    const first = buildMockCampaignAction({
      campaignId: "phc_1",
      userId: "usr_emp_1",
    });
    const second = buildMockCampaignAction({
      campaignId: "phc_1",
      userId: "usr_emp_1",
    });
    expect(first).toBe(second);
  });

  it("derives metrics from campaign actions", () => {
    const metrics = buildCampaignMetricsFromActions([
      "CLICKED",
      "OPENED",
      "REPORTED",
      "IGNORED",
    ]);
    expect(metrics.sentCount).toBe(4);
    expect(metrics.openedCount).toBe(3);
    expect(metrics.clickedCount).toBe(1);
    expect(metrics.reportedCount).toBe(1);
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

    const dashboard = await getManagerDashboardMetricsV2({ range: "30d" });
    expect(dashboard.sentCount).toBeGreaterThanOrEqual(expectedRecipients);
    expect(dashboard.deptBreakdown.some((dept) => dept.departmentId === departmentId)).toBe(true);
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

  it("returns department-focused manager metrics", async () => {
    const template = listPhishingTemplates()[0];
    const campaign = await createAdminPhishingCampaign({
      name: "Отдел Продажби",
      templateId: template.id,
      subject: template.subject,
      senderName: template.senderName,
      content: template.content,
      departmentId: "dept_sales",
    });
    await startAdminPhishingCampaign(campaign.id);

    const metrics = await getManagerDepartmentMetricsV2({
      departmentId: "dept_sales",
      range: "30d",
    });
    expect(metrics.department.departmentId).toBe("dept_sales");
    expect(metrics.users.length).toBeGreaterThan(0);
    expect(metrics.sentCount).toBeGreaterThan(0);
  });
});
