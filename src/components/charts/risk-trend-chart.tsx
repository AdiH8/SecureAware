"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface TrendPoint {
  label: string;
  knowledge: number;
  reactionRisk: number;
}

export function RiskTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
          <XAxis dataKey="label" stroke="#5f6c67" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#5f6c67" tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            dataKey="knowledge"
            name="Знание"
            stroke="#0f766e"
            strokeWidth={3}
            dot={false}
          />
          <Line
            dataKey="reactionRisk"
            name="Реакционен риск"
            stroke="#b45309"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
