import { RiskBand } from "@/lib/types";
import { cn } from "@/lib/utils";
import { uiCopy } from "@/content/bg";

const labels: Record<RiskBand, string> = {
  HIGH: uiCopy.risk.high,
  MEDIUM: uiCopy.risk.medium,
  SECURE: uiCopy.risk.secure,
};

const classByRisk: Record<RiskBand, string> = {
  HIGH: "sa-tag sa-tag-high",
  MEDIUM: "sa-tag sa-tag-med",
  SECURE: "sa-tag sa-tag-secure",
};

export function RiskBadge({ risk }: { risk: RiskBand }) {
  return <span className={cn(classByRisk[risk])}>{labels[risk]}</span>;
}
