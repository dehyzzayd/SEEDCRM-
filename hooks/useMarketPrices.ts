"use client";

import { useQuery } from "@tanstack/react-query";
import type { MarketPrice } from "@/types";

export function useMarketPrices(params?: { commodity?: string; deliveryPoint?: string; days?: number }) {
  const qs = new URLSearchParams(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  ).toString();

  return useQuery<{ data: MarketPrice[] }>({
    queryKey: ["market-prices", params],
    queryFn: async () => {
      const res = await fetch(`/api/market-prices?${qs}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLatestMarketPrices() {
  return useQuery<{ data: MarketPrice[] }>({
    queryKey: ["market-prices-latest"],
    queryFn: async () => {
      const res = await fetch("/api/market-prices/latest");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });
}
