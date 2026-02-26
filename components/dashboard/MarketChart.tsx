"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface Props {
  chartData: Record<string, string | number>[];
  allIndices: string[];
  selectedIndices: string[];
  colors: string[];
  datesLength: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-hover border border-border-hover rounded px-3 py-2 shadow-modal">
      <p className="text-xs text-text-secondary mb-2">{label}</p>
      {payload.filter(p => p.value > 0).map((p, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(4)}
        </p>
      ))}
    </div>
  );
}

export default function MarketChart({ chartData, allIndices, selectedIndices, colors, datesLength }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          interval={Math.floor(datesLength / 8)}
        />
        <YAxis
          tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={(v: number) => v.toFixed(2)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "10px", color: "#64748B", fontFamily: "Inter" }}
          iconSize={6}
        />
        {allIndices
          .filter(idx => selectedIndices.includes(idx))
          .map((idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={idx}
              stroke={colors[allIndices.indexOf(idx) % colors.length]}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
