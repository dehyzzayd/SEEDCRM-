"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLatestMarketPrices, useMarketPrices } from "@/hooks/useMarketPrices";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatPrice, formatPercent, formatDate, getCommodityLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Commodity, MarketPrice } from "@/types";
import { MARKET_INDICES } from "@/lib/constants";
import { EmptyState } from "@/components/shared/EmptyState";
import { format } from "date-fns";

// Lazy-load recharts — only loaded when the chart section renders
const MarketChart = dynamic(() => import("@/components/dashboard/MarketChart"), {
  ssr: false,
  loading: () => <div className="skeleton h-full rounded" />,
});

const CHART_COLORS = ["#00D4AA", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];

export default function MarketPage() {
  const [selectedIndices, setSelectedIndices] = useState<string[]>([MARKET_INDICES[0].deliveryPoint]);
  const [days, setDays] = useState(30);

  const { data: latestData, isLoading: latestLoading } = useLatestMarketPrices();
  const latestPrices = latestData?.data ?? [];

  const { data: histData, isLoading: histLoading } = useMarketPrices({ days });

  const histPrices = histData?.data ?? [];
  const dateSet = new Set(histPrices.map(p => format(new Date(p.date), "MM/dd")));
  const dates = [...dateSet].sort();

  const priceByIndexDate: Record<string, Record<string, number>> = {};
  histPrices.forEach(p => {
    const key = p.indexName;
    if (!priceByIndexDate[key]) priceByIndexDate[key] = {};
    priceByIndexDate[key][format(new Date(p.date), "MM/dd")] = Number(p.settlementPrice);
  });

  const chartData = dates.map(date => {
    const point: Record<string, string | number> = { date };
    Object.entries(priceByIndexDate).forEach(([idx, vals]) => {
      point[idx] = vals[date] ?? 0;
    });
    return point;
  });

  const allIndices = [...new Set(histPrices.map(p => p.indexName))];

  const toggleIndex = (idx: string) => {
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div>
      <PageHeader
        title="Market Data"
        description="Commodity price indices and historical data"
      />

      <div className="p-6 space-y-6">
        {/* Price cards grid */}
        <div className="grid grid-cols-3 gap-4">
          {latestLoading
            ? Array.from({length:6}).map((_,i)=><div key={i} className="skeleton h-28 rounded-md" />)
            : latestPrices.length === 0 ? (
              <div className="col-span-3 card"><EmptyState icon={TrendingUp} title="No market data available" description="Market price data hasn't been loaded yet. Run the database seed or connect your EIA API key to populate live Henry Hub, WTI, and power prices." hint="Add EIA_API_KEY to your .env to enable live data." size="md" /></div>
            ) : latestPrices.map((p, i) => <PriceCard key={i} price={p} />)}
        </div>

        {/* Interactive chart */}
        <div className="card">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-sm font-semibold text-text-primary">Price History</h2>
            <div className="flex items-center gap-2">
              {[7, 30, 60, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    "px-2.5 h-7 rounded text-xs transition-fast",
                    days === d ? "bg-accent text-bg-base font-semibold" : "text-text-tertiary hover:text-text-secondary"
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Index selector */}
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {allIndices.map((idx, i) => (
              <button
                key={idx}
                onClick={() => toggleIndex(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-2 h-6 rounded border text-[11px] transition-fast",
                  selectedIndices.includes(idx)
                    ? "border-transparent text-white"
                    : "border-border-default text-text-tertiary hover:border-border-hover"
                )}
                style={selectedIndices.includes(idx) ? {
                  backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + "30",
                  borderColor: CHART_COLORS[i % CHART_COLORS.length],
                  color: CHART_COLORS[i % CHART_COLORS.length],
                } : undefined}
              >
                {idx}
              </button>
            ))}
          </div>

          <div className="px-4 pb-4 h-[300px]">
            {histLoading ? (
              <div className="skeleton h-full rounded" />
            ) : (
              <MarketChart
                chartData={chartData}
                allIndices={allIndices}
                selectedIndices={selectedIndices}
                colors={CHART_COLORS}
                datesLength={dates.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ price }: { price: MarketPrice }) {
  const change = Number(price.changePercent);
  const isPos = change >= 0;

  return (
    <div className="card p-4 hover:border-border-hover transition-fast">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-text-secondary truncate">{price.indexName}</p>
        <span className="text-[10px] text-text-disabled">{getCommodityLabel(price.commodity)}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="font-mono text-xl font-semibold text-text-primary">
          {formatPrice(Number(price.settlementPrice), price.commodity.includes("GAS") ? 3 : 2)}
        </p>
        <div className="text-right">
          <p className={cn("font-mono text-sm font-medium", isPos ? "text-success" : "text-danger")}>
            {isPos ? "+" : ""}{Number(price.changeAbsolute).toFixed(3)}
          </p>
          <p className={cn("font-mono text-[11px]", isPos ? "text-success" : "text-danger")}>
            {formatPercent(change, 2)}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-text-disabled mt-1.5 font-mono">{formatDate(price.date)}</p>
    </div>
  );
}
