"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  orgId: string;
  tier: string;
  currentTier: string;
}

export function ChangeTierButton({ orgId, tier, currentTier }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isActive = tier === currentTier;

  const base    = "px-5 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    FREE:       isActive ? "bg-surface-secondary border-border-secondary text-text-primary"       : "border-border-primary text-text-secondary hover:bg-surface-secondary",
    PRO:        isActive ? "bg-blue-500/20 border-blue-500 text-blue-300"                         : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
    ENTERPRISE: isActive ? "bg-accent-primary/20 border-accent-primary text-accent-primary"       : "border-accent-primary/30 text-accent-primary hover:bg-accent-primary/10",
  };

  async function handleClick() {
    if (isActive) return;
    setLoading(true);
    await fetch(`/api/admin/orgs/${orgId}/tier`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={isActive || loading} className={`${base} ${styles[tier]}`}>
      {loading ? "Updating…" : isActive ? `✓ ${tier}` : tier}
    </button>
  );
}
