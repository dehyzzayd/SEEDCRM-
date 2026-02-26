"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { getCommodityLabel, formatVolumeCompact } from "@/lib/utils";
import type { Commodity } from "@/types";

interface PositionData {
  commodity: Commodity;
  buyVolume: number;
  sellVolume: number;
  netVolume: number;
  unit: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; fill: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-hover border border-border-hover rounded px-3 py-2 shadow-modal">
      <p className="text-xs font-medium text-text-primary mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.fill }}>
          {p.name}: {formatVolumeCompact(p.value)}
        </p>
      ))}
    </div>
  );
};

export function PositionChart({ data }: { data: PositionData[] }) {
  const chartData = data.map(d => ({
    commodity: getCommodityLabel(d.commodity),
    "Long (Buy)": d.buyVolume,
    "Short (Sell)": d.sellVolume,
    "Net": d.netVolume,
  }));

  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
          <XAxis
            dataKey="commodity"
            tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatVolumeCompact}
            tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Legend
            wrapperStyle={{ fontSize: "11px", color: "#64748B", fontFamily: "Inter" }}
            iconSize={8}
          />
          <ReferenceLine y={0} stroke="#1E293B" />
          <Bar dataKey="Long (Buy)" fill="#10B981" radius={[2, 2, 0, 0]} maxBarSize={32} />
          <Bar dataKey="Short (Sell)" fill="#EF4444" radius={[2, 2, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
