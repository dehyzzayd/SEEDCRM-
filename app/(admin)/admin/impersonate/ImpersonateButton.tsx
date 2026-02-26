"use client";

import { useState } from "react";

export function ImpersonateButton({ userId, userName }: { userId: string; userName: string }) {
  const [loading, setLoading] = useState(false);
  const [token, setToken]     = useState<string | null>(null);

  async function handleImpersonate() {
    setLoading(true);
    const res  = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setToken(data.token ?? null);
    setLoading(false);
  }

  if (token) {
    return (
      <div className="flex items-center gap-2">
        <code className="text-xs bg-surface-primary border border-border-primary px-2 py-1 rounded font-mono text-accent-primary max-w-[180px] truncate">
          {token}
        </code>
        <a
          href={`/api/admin/impersonate/login?token=${token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-md bg-orange-500 hover:bg-orange-400 text-white font-medium transition-colors"
        >
          Open Session →
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-primary transition-colors disabled:opacity-50"
    >
      {loading ? "Generating…" : "Impersonate"}
    </button>
  );
}
