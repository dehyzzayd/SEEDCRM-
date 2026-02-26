"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { NewContractSlideOver } from "@/components/contracts/NewContractSlideOver";
import { ContractStatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, daysUntil, getContractExpiryColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Contract } from "@/types";
import { FileText, Plus } from "lucide-react";

export default function ContractsPage() {
  const [slideOverOpen, setSlideOverOpen] = useState(false);

  const { data, isLoading } = useQuery<{
    data: (Contract & { counterparty: { name: string; shortName: string } })[];
    meta: { total: number };
  }>({
    queryKey: ["contracts"],
    queryFn:  () => fetch("/api/contracts?pageSize=50").then(r => r.json()),
  });

  const contracts = data?.data ?? [];
  const isEmpty   = !isLoading && contracts.length === 0;

  return (
    <div>
      <PageHeader
        title="Contracts"
        description={isEmpty ? "Master agreements and deal contracts" : `${data?.meta?.total ?? 0} total contracts`}
        actions={
          <button
            className="btn-primary"
            onClick={() => setSlideOverOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            New Contract
          </button>
        }
      />

      <div className="p-6">
        {isEmpty ? (
          <div className="card">
            <EmptyState
              icon={FileText}
              title="No contracts on file"
              description="Track your ISDA Master Agreements, NaESB Base Contracts, and deal-specific contracts. Dehy monitors expiration dates and flags renewals automatically."
              hint="Start by linking a contract to one of your counterparties, or upload a standalone master agreement."
              action={
                <button
                  className="btn-primary inline-flex items-center gap-2"
                  onClick={() => setSlideOverOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add first contract
                </button>
              }
              size="lg"
            />
          </div>
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Contract #</th>
                      <th>Counterparty</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Effective Date</th>
                      <th>Expiration Date</th>
                      <th className="text-right">Days Until Expiry</th>
                      <th className="text-center">Auto-Renew</th>
                      <th>Related Deal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading
                      ? Array.from({ length: 8 }).map((_, i) => (
                          <tr key={i}>
                            {Array.from({ length: 9 }).map((_, j) => (
                              <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                            ))}
                          </tr>
                        ))
                      : contracts.map(contract => {
                          const days        = daysUntil(contract.expirationDate);
                          const expiryColor = getContractExpiryColor(days);
                          return (
                            <tr
                              key={contract.id}
                              className={cn(
                                days !== null && days < 30 ? "bg-danger/3"  :
                                days !== null && days < 90 ? "bg-warning/3" : ""
                              )}
                            >
                              <td className="font-mono text-[11px] text-text-primary font-medium">
                                {contract.contractNumber}
                              </td>
                              <td>
                                <p className="text-xs font-medium text-text-primary">{contract.counterparty?.name}</p>
                                <p className="text-[10px] text-text-tertiary font-mono">{contract.counterparty?.shortName}</p>
                              </td>
                              <td className="text-xs text-text-secondary">{contract.type.replace(/_/g, " ")}</td>
                              <td><ContractStatusBadge value={contract.status} /></td>
                              <td className="font-mono text-[11px] text-text-tertiary tabular-nums">
                                {formatDate(contract.effectiveDate)}
                              </td>
                              <td className="font-mono text-[11px] tabular-nums">
                                <span className={expiryColor}>
                                  {contract.expirationDate ? formatDate(contract.expirationDate) : "—"}
                                </span>
                              </td>
                              <td className="font-mono text-[11px] text-right tabular-nums">
                                {days !== null ? (
                                  <span className={cn(expiryColor, days < 0 ? "text-danger" : "")}>
                                    {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d`}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="text-center">
                                <span className={cn("text-xs", contract.autoRenew ? "text-success" : "text-text-disabled")}>
                                  {contract.autoRenew ? "Yes" : "No"}
                                </span>
                              </td>
                              <td className="text-xs text-accent font-mono">
                                {contract.dealId ? "Linked" : "—"}
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] text-text-disabled">Row coloring:</span>
              {[
                ["bg-danger/10",  "<30 days" ],
                ["bg-warning/10", "30–90 days"],
                ["bg-success/10", ">90 days" ],
              ].map(([cls, label]) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={cn("w-3 h-1.5 rounded", cls)} />
                  <span className="text-[10px] text-text-tertiary">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <NewContractSlideOver
        open={slideOverOpen}
        onClose={() => setSlideOverOpen(false)}
      />
    </div>
  );
}
