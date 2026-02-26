"use client";

import { useState } from "react";
import { useDeals } from "@/hooks/useDeals";
import { DealKanban } from "@/components/deals/DealKanban";
import { DealTable } from "@/components/deals/DealTable";
import { DealDetail } from "@/components/deals/DealDetail";
import { DealsEmptyState } from "@/components/deals/DealsEmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, Plus, Filter, X } from "lucide-react";
import type { Deal, DealStage, Commodity, DealDirection } from "@/types";
import Link from "next/link";
import { DEAL_STAGES, COMMODITIES } from "@/lib/constants";

export default function DealsPage() {
  const { dealViewMode, setDealViewMode } = useAppStore();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);

  const [stageFilter,     setStageFilter]     = useState<DealStage[]>([]);
  const [commodityFilter, setCommodityFilter] = useState<Commodity[]>([]);
  const [directionFilter, setDirectionFilter] = useState<DealDirection | "">("");

  const params = {
    page,
    pageSize: dealViewMode === "table" ? 25 : 200,
    sortBy,
    sortOrder,
    ...(stageFilter.length     ? { stage:     stageFilter.join(",")     } : {}),
    ...(commodityFilter.length ? { commodity: commodityFilter.join(",") } : {}),
    ...(directionFilter        ? { direction: directionFilter           } : {}),
  };

  const { data, isLoading } = useDeals(params);
  const deals     = (data?.data ?? []) as Deal[];
  const hasFilters = stageFilter.length > 0 || commodityFilter.length > 0 || !!directionFilter;
  const isEmpty    = !isLoading && deals.length === 0;

  const handleSort = (col: string) => {
    if (sortBy === col) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortOrder("desc"); }
  };

  const clearFilters = () => {
    setStageFilter([]);
    setCommodityFilter([]);
    setDirectionFilter("");
  };

  const toggleStage     = (s: DealStage)  => setStageFilter(prev     => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleCommodity = (c: Commodity)  => setCommodityFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Deals"
        description={isEmpty && !hasFilters ? "Your deal pipeline" : `${data?.meta?.total ?? 0} total deals`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border-default rounded overflow-hidden">
              <button
                onClick={() => setDealViewMode("kanban")}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-8 text-xs transition-fast",
                  dealViewMode === "kanban" ? "bg-bg-card text-text-primary" : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Pipeline
              </button>
              <button
                onClick={() => setDealViewMode("table")}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-8 text-xs transition-fast border-l border-border-default",
                  dealViewMode === "table" ? "bg-bg-card text-text-primary" : "text-text-tertiary hover:text-text-secondary"
                )}
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn("btn-secondary", hasFilters && "border-accent text-accent")}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {hasFilters && (
                <span className="w-4 h-4 rounded-full bg-accent text-bg-base text-[9px] font-bold flex items-center justify-center">
                  {stageFilter.length + commodityFilter.length + (directionFilter ? 1 : 0)}
                </span>
              )}
            </button>
            <Link href="/deals/new" className="btn-primary">
              <Plus className="w-3.5 h-3.5" />
              New Deal
            </Link>
          </div>
        }
      />

      {showFilters && (
        <div className="px-6 py-4 bg-bg-panel border-b border-border-default">
          <div className="flex items-start gap-8">
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Stage</p>
              <div className="flex flex-wrap gap-1.5">
                {DEAL_STAGES.filter(s => s.value !== "DEAD").map(s => (
                  <button key={s.value} onClick={() => toggleStage(s.value)}
                    className={cn("px-2 py-0.5 rounded text-[11px] border transition-fast",
                      stageFilter.includes(s.value) ? "border-accent bg-accent/10 text-accent" : "border-border-default text-text-tertiary hover:border-border-hover"
                    )}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Commodity</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMODITIES.map(c => (
                  <button key={c.value} onClick={() => toggleCommodity(c.value)}
                    className={cn("px-2 py-0.5 rounded text-[11px] border transition-fast",
                      commodityFilter.includes(c.value) ? "border-accent bg-accent/10 text-accent" : "border-border-default text-text-tertiary hover:border-border-hover"
                    )}>
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-2">Direction</p>
              <div className="flex gap-1.5">
                {(["", "BUY", "SELL"] as const).map(d => (
                  <button key={d || "all"} onClick={() => setDirectionFilter(d)}
                    className={cn("px-2 py-0.5 rounded text-[11px] border transition-fast",
                      directionFilter === d
                        ? d === "BUY" ? "border-success bg-success/10 text-success"
                          : d === "SELL" ? "border-danger bg-danger/10 text-danger"
                          : "border-accent bg-accent/10 text-accent"
                        : "border-border-default text-text-tertiary hover:border-border-hover"
                    )}>
                    {d || "All"}
                  </button>
                ))}
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-text-tertiary hover:text-danger transition-fast mt-5">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state — full page */}
      {isEmpty ? (
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 140px)" }}>
          <DealsEmptyState hasFilters={hasFilters} />
        </div>
      ) : (
        <div className={cn(dealViewMode === "table" && "px-6 pt-4")}>
          {dealViewMode === "kanban" ? (
            <DealKanban deals={deals} onSelectDeal={(d) => setSelectedDealId(d.id)} loading={isLoading} />
          ) : (
            <div className="card overflow-hidden">
              <DealTable
                deals={deals} total={data?.meta?.total ?? 0}
                page={page} pageSize={25}
                onPageChange={setPage} onSort={handleSort}
                sortBy={sortBy} sortOrder={sortOrder}
                onSelectDeal={(d) => setSelectedDealId(d.id)}
                loading={isLoading}
              />
            </div>
          )}
        </div>
      )}

      <DealDetail dealId={selectedDealId} onClose={() => setSelectedDealId(null)} />
    </div>
  );
}
