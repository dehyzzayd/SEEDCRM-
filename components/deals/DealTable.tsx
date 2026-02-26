"use client";

import { useState } from "react";
import { DealStageBadge } from "@/components/shared/StatusBadge";
import { DirectionBadge } from "@/components/shared/DirectionBadge";
import { CommodityIcon } from "@/components/shared/CommodityIcon";
import { PnlDisplay } from "@/components/shared/PnlDisplay";
import { formatCurrency, formatVolume, formatDate, daysInStage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  deals: Deal[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onSort: (col: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSelectDeal: (deal: Deal) => void;
  loading?: boolean;
}

export function DealTable({
  deals, total, page, pageSize, onPageChange, onSort, sortBy, sortOrder, onSelectDeal, loading,
}: Props) {
  const columns = [
    { key: "dealNumber", label: "Deal #", sortable: true },
    { key: "counterparty", label: "Counterparty", sortable: false },
    { key: "direction", label: "Dir", sortable: true },
    { key: "commodity", label: "Commodity", sortable: true },
    { key: "deliveryPoint", label: "Delivery Point", sortable: false },
    { key: "volume", label: "Volume", sortable: true },
    { key: "fixedPrice", label: "Price", sortable: true },
    { key: "totalNotionalValue", label: "Notional", sortable: true },
    { key: "unrealizedPnl", label: "Unreal. P&L", sortable: true },
    { key: "stage", label: "Stage", sortable: true },
    { key: "assignedUser", label: "Assigned", sortable: false },
    { key: "createdAt", label: "Created", sortable: true },
  ];

  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortOrder === "asc"
      ? <ArrowUp className="w-3 h-3 ml-1 text-accent" />
      : <ArrowDown className="w-3 h-3 ml-1 text-accent" />;
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(col.sortable && "cursor-pointer hover:text-text-secondary transition-fast")}
                  onClick={col.sortable ? () => onSort(col.key) : undefined}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-text-tertiary text-sm">
                  No deals found
                </td>
              </tr>
            ) : (
              deals.map(deal => {
                const cp = deal.counterparty as { name: string; shortName: string } | undefined;
                const user = deal.assignedUser as { name: string } | undefined;
                const daysSince = deal.milestones
                  ? (() => {
                      const current = [...deal.milestones]
                        .filter(m => m.stage === deal.stage)
                        .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())[0];
                      return current ? daysInStage(current.enteredAt) : 0;
                    })()
                  : 0;

                return (
                  <tr
                    key={deal.id}
                    className="cursor-pointer"
                    onClick={() => onSelectDeal(deal)}
                  >
                    <td className="font-mono text-accent text-[11px] font-medium">{deal.dealNumber}</td>
                    <td>
                      <div>
                        <p className="text-xs font-medium text-text-primary">{cp?.name ?? "—"}</p>
                        <p className="text-[10px] text-text-tertiary font-mono">{cp?.shortName}</p>
                      </div>
                    </td>
                    <td><DirectionBadge direction={deal.direction} /></td>
                    <td>
                      <CommodityIcon commodity={deal.commodity} showLabel size="xs" />
                    </td>
                    <td className="text-xs text-text-secondary max-w-[140px] truncate">{deal.deliveryPoint}</td>
                    <td className="font-mono text-xs text-right text-text-primary tabular-nums">
                      {formatVolume(deal.volume)} <span className="text-text-tertiary">{deal.volumeUnit}</span>
                    </td>
                    <td className="font-mono text-xs text-right tabular-nums text-text-primary">
                      {deal.fixedPrice ? `$${Number(deal.fixedPrice).toFixed(4)}` : "—"}
                    </td>
                    <td className="font-mono text-xs text-right tabular-nums font-medium text-text-primary">
                      {formatCurrency(deal.totalNotionalValue, "USD", true)}
                    </td>
                    <td className="font-mono text-xs text-right tabular-nums">
                      {["EXECUTED","DELIVERING"].includes(deal.stage)
                        ? <PnlDisplay value={deal.unrealizedPnl} compact />
                        : <span className="text-text-disabled">—</span>}
                    </td>
                    <td><DealStageBadge value={deal.stage} /></td>
                    <td className="text-xs text-text-secondary">{user?.name ?? "—"}</td>
                    <td className="font-mono text-[11px] text-text-tertiary tabular-nums">
                      {formatDate(deal.createdAt)}
                      {daysSince > 0 && (
                        <span className={cn(
                          "ml-1.5 text-[10px]",
                          daysSince > 14 ? "text-warning" : "text-text-disabled"
                        )}>
                          {daysSince}d
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-default">
          <p className="text-xs text-text-tertiary">
            Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded text-text-tertiary hover:text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-fast"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "w-7 h-7 rounded text-xs font-mono transition-fast",
                  p === page
                    ? "bg-accent text-bg-base font-semibold"
                    : "text-text-tertiary hover:text-text-secondary hover:bg-bg-hover"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded text-text-tertiary hover:text-text-secondary hover:bg-bg-hover disabled:opacity-30 transition-fast"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
