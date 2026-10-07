"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type IncidentBreakdown = {
  _id: string;
  incidentCount: number;
};

export function IncidentBreakdownChart({
  title,
  breakdown,
}: {
  title: string;
  breakdown: IncidentBreakdown[];
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {breakdown.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">No incident locations available yet.</p>
      ) : (
        <div className="mt-4 h-72 w-full" role="img" aria-label={title}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={breakdown}
              margin={{ top: 12, right: 8, bottom: 8, left: -16 }}
            >
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="_id"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={64}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
              />
              <YAxis
                allowDecimals={false}
                width={36}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.06)" }}
                contentStyle={{
                  backgroundColor: "#1c1c1c",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  color: "#fff",
                }}
                labelStyle={{ color: "#d1d5db" }}
                itemStyle={{ color: "#818cf8" }}
                formatter={(value) => [value, "Incidents"]}
              />
              <Bar
                dataKey="incidentCount"
                name="Incidents"
                fill="#6366f1"
                radius={[5, 5, 0, 0]}
                maxBarSize={44}
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
