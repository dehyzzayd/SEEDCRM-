import { cn } from "@/lib/utils";
import type { DealStage, CounterpartyStatus, ContractStatus } from "@/types";

interface Props {
  value: string;
  className?: string;
}

export function DealStageBadge({ value, className }: Props) {
  const config: Record<DealStage, { label: string; bg: string; text: string }> = {
    ORIGINATION: { label: "Origination", bg: "bg-[#64748B]/15", text: "text-[#64748B]" },
    INDICATIVE: { label: "Indicative", bg: "bg-[#8B5CF6]/15", text: "text-[#8B5CF6]" },
    FIRM_BID: { label: "Firm Bid", bg: "bg-blue-500/15", text: "text-blue-400" },
    CREDIT_REVIEW: { label: "Credit Review", bg: "bg-warning/15", text: "text-warning" },
    LEGAL_REVIEW: { label: "Legal Review", bg: "bg-accent/15", text: "text-accent" },
    EXECUTED: { label: "Executed", bg: "bg-success/15", text: "text-success" },
    DELIVERING: { label: "Delivering", bg: "bg-success/15", text: "text-success" },
    SETTLED: { label: "Settled", bg: "bg-text-tertiary/15", text: "text-text-tertiary" },
    DEAD: { label: "Dead", bg: "bg-danger/15", text: "text-danger" },
  };
  const c = config[value as DealStage] ?? { label: value, bg: "bg-bg-hover", text: "text-text-secondary" };
  return (
    <span className={cn("badge", c.bg, c.text, className)}>
      {c.label}
    </span>
  );
}

export function CounterpartyStatusBadge({ value, className }: Props) {
  const config: Record<CounterpartyStatus, { label: string; bg: string; text: string }> = {
    ACTIVE: { label: "Active", bg: "bg-success/15", text: "text-success" },
    INACTIVE: { label: "Inactive", bg: "bg-text-tertiary/15", text: "text-text-tertiary" },
    SUSPENDED: { label: "Suspended", bg: "bg-danger/15", text: "text-danger" },
    PENDING_REVIEW: { label: "Pending Review", bg: "bg-warning/15", text: "text-warning" },
  };
  const c = config[value as CounterpartyStatus] ?? { label: value, bg: "bg-bg-hover", text: "text-text-secondary" };
  return (
    <span className={cn("badge", c.bg, c.text, className)}>
      {c.label}
    </span>
  );
}

export function ContractStatusBadge({ value, className }: Props) {
  const config: Record<ContractStatus, { label: string; bg: string; text: string }> = {
    DRAFT: { label: "Draft", bg: "bg-text-tertiary/15", text: "text-text-tertiary" },
    ACTIVE: { label: "Active", bg: "bg-success/15", text: "text-success" },
    EXPIRED: { label: "Expired", bg: "bg-danger/15", text: "text-danger" },
    TERMINATED: { label: "Terminated", bg: "bg-danger/15", text: "text-danger" },
  };
  const c = config[value as ContractStatus] ?? { label: value, bg: "bg-bg-hover", text: "text-text-secondary" };
  return (
    <span className={cn("badge", c.bg, c.text, className)}>
      {c.label}
    </span>
  );
}
