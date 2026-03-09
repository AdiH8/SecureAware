import {
  PhishingCampaignAction,
  PhishingCampaignMetrics,
  PhishingCampaignStatus,
} from "@/lib/types";

function hashSeed(input: string): number {
  return Array.from(input).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

export function buildMockCampaignMetrics(params: {
  campaignId: string;
  recipientCount: number;
}): PhishingCampaignMetrics {
  const sentCount = Math.max(0, Math.trunc(params.recipientCount));
  if (sentCount === 0) {
    return {
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      reportedCount: 0,
      clickRate: 0,
      reportRate: 0,
    };
  }

  const seed = hashSeed(params.campaignId);
  const openRate = 62 + (seed % 12);
  const clickRateBase = 14 + (seed % 9);
  const reportRateBase = 28 + (seed % 11);

  const openedCount = Math.min(sentCount, Math.round((sentCount * openRate) / 100));
  const clickedCount = Math.min(openedCount, Math.round((sentCount * clickRateBase) / 100));
  const reportedCount = Math.min(openedCount, Math.round((sentCount * reportRateBase) / 100));

  return {
    sentCount,
    openedCount,
    clickedCount,
    reportedCount,
    clickRate: Math.round((clickedCount / sentCount) * 100),
    reportRate: Math.round((reportedCount / sentCount) * 100),
  };
}

export function startCampaignLifecycle(): PhishingCampaignStatus[] {
  return ["QUEUED", "SENT", "COMPLETED"];
}

export function buildMockCampaignAction(params: {
  campaignId: string;
  userId: string;
}): PhishingCampaignAction {
  const seed = hashSeed(`${params.campaignId}:${params.userId}`) % 100;
  if (seed < 18) return "CLICKED";
  if (seed < 46) return "OPENED";
  if (seed < 68) return "IGNORED";
  return "REPORTED";
}

export function buildCampaignMetricsFromActions(
  actions: PhishingCampaignAction[]
): PhishingCampaignMetrics {
  const sentCount = actions.length;
  if (!sentCount) {
    return {
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      reportedCount: 0,
      clickRate: 0,
      reportRate: 0,
    };
  }

  const openedCount = actions.filter(
    (action) => action === "OPENED" || action === "CLICKED" || action === "REPORTED"
  ).length;
  const clickedCount = actions.filter((action) => action === "CLICKED").length;
  const reportedCount = actions.filter((action) => action === "REPORTED").length;

  return {
    sentCount,
    openedCount,
    clickedCount,
    reportedCount,
    clickRate: Math.round((clickedCount / sentCount) * 100),
    reportRate: Math.round((reportedCount / sentCount) * 100),
  };
}
