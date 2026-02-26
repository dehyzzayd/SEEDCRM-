"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CounterpartyStatusBadge } from "@/components/shared/StatusBadge";
import { CreditRatingBadge } from "@/components/shared/CreditRatingBadge";
import { formatCurrency, getCreditUtilizationColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Counterparty } from "@/types";
import { Search, Building2, Plus } from "lucide-react";
import Link from "next/link";

export default function CounterpartiesPage() {
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery<{ data: (Counterparty & { _count: { deals: number } })[]; meta: { total: number } }>({
    queryKey: ["counterparties", { search, page }],
    queryFn:  async () => {
      const qs = new URLSearchParams({ search, page: String(page), pageSize: "25" }).toString();
      return fetch(`/api/counterparties?${qs}`).then(r => r.json());
    },
  });

  const counterparties = data?.data ?? [];
  const isEmpty        = !isLoading && counterparties.length === 0;

  return (
    <div>
      <PageHeader
        title="Counterparties"
        description={isEmpty && !search ? "Your trading counterparties" : `${data?.meta?.total ?? 0} total counterparties`}
        actions={
          <button className="btn-primary">
            <Plus className="w-3.5 h-3.5" />
            New Counterparty
          </button>
        }
      />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search counterparties..."
              className="w-full h-9 bg-bg-panel border border-border-default rounded pl-9 pr-3 text-sm text-text-primary focus:border-accent outline-none transition-fast"
            />
          </div>
        </div>

        {isEmpty ? (
          <div className="card">
            <EmptyState
              icon={Building2}
              title={search ? "No counterparties match your search" : "No counterparties yet"}
              description={
                search
                  ? `No results for "${search}". Try a different name or ticker.`
                  : "Add the trading firms, utilities, and financial institutions you trade with. Dehy tracks credit limits, ISDA agreements, and exposure per counterparty."
              }
              hint={search ? undefined : "Typical counterparties include Shell, BP, Vitol, Mercuria, or your regional utility providers."}
              action={
                !search ? (
                  <button className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5" />
                    Add first counterparty
                  </button>
                ) : undefined
              }
              size="lg"
            />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Ticker</th>
                    <th>Type</th>
                    <th>Rating</th>
                    <th className="text-right">Credit Limit</th>
                    <th className="text-right">Exposure</th>
                    <th>Utilization</th>
                    <th className="text-center">Deals</th>
                    <th className="text-center">ISDA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i}>{Array.from({ length: 10 }).map((_, j) => <td key={j}><div className="skeleton h-4 w-full rounded" /></td>)}</tr>
                      ))
                    : counterparties.map(cp => {
                        const util = cp.creditLimit > 0 ? Math.round((cp.currentExposure / cp.creditLimit) * 100) : 0;
                        return (
                          <tr key={cp.id}>
                            <td>
                              <Link href={`/counterparties/${cp.id}`} className="text-text-primary hover:text-accent transition-fast font-medium text-xs">{cp.name}</Link>
                            </td>
                            <td><span className="font-mono text-[11px] text-text-secondary bg-bg-hover px-1.5 py-0.5 rounded">{cp.shortName}</span></td>
                            <td><span className="text-xs text-text-secondary">{cp.type.replace(/_/g, " ")}</span></td>
                            <td><CreditRatingBadge rating={cp.creditRating} /></td>
                            <td className="font-mono text-xs text-right tabular-nums text-text-primary">{formatCurrency(Number(cp.creditLimit), "USD", true)}</td>
                            <td className="font-mono text-xs text-right tabular-nums text-text-primary">{formatCurrency(Number(cp.currentExposure), "USD", true)}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-bg-hover rounded-full overflow-hidden max-w-[80px]">
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(util, 100)}%`, backgroundColor: getCreditUtilizationColor(util) }} />
                                </div>
                                <span className={cn("font-mono text-[10px] tabular-nums", util > 85 ? "text-danger" : util > 60 ? "text-warning" : "text-success")}>{util}%</span>
                              </div>
                            </td>
                            <td className="text-center font-mono text-xs text-text-secondary">{cp._count?.deals ?? 0}</td>
                            <td className="text-center">{cp.isdaMasterAgreement ? <span className="text-success text-xs">✓</span> : <span className="text-text-disabled text-xs">—</span>}</td>
                            <td><CounterpartyStatusBadge value={cp.status} /></td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
