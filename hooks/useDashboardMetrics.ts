"use client";

import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics } from "@/types";

export function useDashboardMetrics() {
  return useQuery<{ data: DashboardMetrics }>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/metrics");
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
