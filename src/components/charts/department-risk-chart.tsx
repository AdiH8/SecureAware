"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface DepartmentBar {
  departmentName: string;
  overallRiskScore: number;
}

export function DepartmentRiskChart({ data }: { data: DepartmentBar[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="departmentName" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar dataKey="overallRiskScore" fill="#164e63" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
