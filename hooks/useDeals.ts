"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Deal, CreateDealInput } from "@/types";

interface DealsResponse {
  data: Deal[];
  meta: { total: number; page: number; pageSize: number; totalPages: number };
}

export function useDeals(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  return useQuery<DealsResponse>({
    queryKey: ["deals", params],
    queryFn: async () => {
      const res = await fetch(`/api/deals?${qs}`);
      if (!res.ok) throw new Error("Failed to fetch deals");
      return res.json();
    },
  });
}

export function useDeal(id: string) {
  return useQuery<{ data: Deal }>({
    queryKey: ["deal", id],
    queryFn: async () => {
      const res = await fetch(`/api/deals/${id}`);
      if (!res.ok) throw new Error("Deal not found");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDealInput) => {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create deal");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deal> }) => {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update deal");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      qc.invalidateQueries({ queryKey: ["deal", id] });
      qc.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/deals/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
    },
  });
}
