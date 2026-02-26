import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import type { Currency, DealStage, CreditRating, Commodity } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

export function formatCurrency(
  value: number | null | undefined,
  currency: Currency = "USD",
  compact = false
): string {
  if (value === null || value === undefined) return "—";
  const opts: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  if (compact && Math.abs(value) >= 1_000_000) {
    const million = value / 1_000_000;
    return `$${million.toFixed(1)}M`;
  }
  if (compact && Math.abs(value) >= 1_000) {
    const thousand = value / 1_000;
    return `$${thousand.toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", opts).format(value);
}

export function formatPnl(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (value < 0) {
    return `(${formatCurrency(Math.abs(value))})`;
  }
  return `+${formatCurrency(value)}`;
}

export function formatPrice(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// ─── Volume Formatting ────────────────────────────────────────────────────────

export function formatVolume(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return "—";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatVolumeCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MM/dd/yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return format(new Date(date), "MM/dd/yyyy HH:mm");
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${format(new Date(start), "MMM d, yyyy")} – ${format(new Date(end), "MMM d, yyyy")}`;
}

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  return differenceInDays(new Date(date), new Date());
}

export function daysInStage(enteredAt: Date | string): number {
  return differenceInDays(new Date(), new Date(enteredAt));
}

// ─── Number Formatting ────────────────────────────────────────────────────────

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

// ─── Deal Number Generation ───────────────────────────────────────────────────

export function generateDealNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(5, "0");
  return `DEHY-${year}-${padded}`;
}

// ─── Color Utilities ──────────────────────────────────────────────────────────

export function getPnlColor(value: number | null | undefined): string {
  if (!value) return "text-text-secondary";
  return value >= 0 ? "text-success" : "text-danger";
}

export function getStageColor(stage: DealStage): string {
  const colors: Record<DealStage, string> = {
    ORIGINATION: "#64748B",
    INDICATIVE: "#8B5CF6",
    FIRM_BID: "#3B82F6",
    CREDIT_REVIEW: "#F59E0B",
    LEGAL_REVIEW: "#00D4AA",
    EXECUTED: "#10B981",
    DELIVERING: "#10B981",
    SETTLED: "#94A3B8",
    DEAD: "#EF4444",
  };
  return colors[stage] ?? "#64748B";
}

export function getCreditRatingColor(rating: CreditRating): string {
  const investmentGrade = ["AAA","AA_PLUS","AA","AA_MINUS","A_PLUS","A","A_MINUS","BBB_PLUS","BBB","BBB_MINUS"];
  const speculativeGrade = ["BB_PLUS","BB","BB_MINUS","B_PLUS","B","B_MINUS"];
  if (investmentGrade.includes(rating)) return "#10B981";
  if (speculativeGrade.includes(rating)) return "#F59E0B";
  if (rating === "UNRATED") return "#64748B";
  return "#EF4444"; // CCC, CC, C, D
}

export function getCreditRatingLabel(rating: CreditRating): string {
  const labels: Record<CreditRating, string> = {
    AAA: "AAA", AA_PLUS: "AA+", AA: "AA", AA_MINUS: "AA-",
    A_PLUS: "A+", A: "A", A_MINUS: "A-",
    BBB_PLUS: "BBB+", BBB: "BBB", BBB_MINUS: "BBB-",
    BB_PLUS: "BB+", BB: "BB", BB_MINUS: "BB-",
    B_PLUS: "B+", B: "B", B_MINUS: "B-",
    CCC: "CCC", CC: "CC", C: "C", D: "D",
    UNRATED: "NR",
  };
  return labels[rating] ?? rating;
}

export function getCommodityLabel(commodity: Commodity): string {
  const labels: Record<Commodity, string> = {
    NATURAL_GAS: "Natural Gas",
    CRUDE_OIL_WTI: "WTI",
    CRUDE_OIL_BRENT: "Brent",
    POWER: "Power",
    NGLS: "NGLs",
    REFINED_PRODUCTS: "Refined Products",
    CARBON_CREDITS: "Carbon Credits",
    RENEWABLE_ENERGY_CREDITS: "RECs",
    OTHER: "Other",
  };
  return labels[commodity] ?? commodity;
}

// ─── Credit Exposure ──────────────────────────────────────────────────────────

export function getCreditUtilizationColor(utilization: number): string {
  if (utilization < 60) return "#10B981";
  if (utilization < 85) return "#F59E0B";
  return "#EF4444";
}

// ─── Contract Expiry ──────────────────────────────────────────────────────────

export function getContractExpiryColor(daysUntilExpiry: number | null): string {
  if (daysUntilExpiry === null) return "text-text-secondary";
  if (daysUntilExpiry < 30) return "text-danger";
  if (daysUntilExpiry < 90) return "text-warning";
  return "text-success";
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function getPaginationRange(
  page: number,
  totalPages: number,
  delta = 2
): (number | "...")[] {
  const range: (number | "...")[] = [];
  const left = page - delta;
  const right = page + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  return range;
}
