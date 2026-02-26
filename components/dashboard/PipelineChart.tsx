"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getStageColor } from "@/lib/utils";
import type { DealStage } from "@/types";

interface Props {
  data: { stage: DealStage; count: number; totalValue: number }[];
}

const STAGE_LABELS: Record<DealStage, string> = {
  ORIGINATION: "Orig",
  INDICATIVE: "Indic",
  FIRM_BID: "Firm",
  CREDIT_REVIEW: "Credit",
  LEGAL_REVIEW: "Legal",
  EXECUTED: "Exec",
  DELIVERING: "Deliv",
  SETTLED: "Settled",
  DEAD: "Dead",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: { stage: DealStage; totalValue: number } }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-bg-hover border border-border-hover rounded px-3 py-2 shadow-modal">
      <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
      <p className="text-xs text-text-secondary font-mono">{payload[0].value} deals</p>
      <p className="text-xs text-accent font-mono">
        ${(data.totalValue / 1_000_000).toFixed(1)}M notional
      </p>
    </div>
  );
};

export function PipelineChart({ data }: Props) {
  const activeStages: DealStage[] = ["ORIGINATION","INDICATIVE","FIRM_BID","CREDIT_REVIEW","LEGAL_REVIEW","EXECUTED","DELIVERING"];
  const filtered = activeStages
    .map(s => data.find(d => d.stage === s) ?? { stage: s, count: 0, totalValue: 0 })
    .filter(d => d.count > 0 || true);

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filtered} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barSize={28}>
          <XAxis
            dataKey="stage"
            tickFormatter={s => STAGE_LABELS[s as DealStage] ?? s}
            tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 10, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {filtered.map((entry, i) => (
              <Cell key={i} fill={getStageColor(entry.stage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
