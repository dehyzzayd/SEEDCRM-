"use client";

import { useState } from "react";

export function ResetPasswordButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [loading,  setLoading]  = useState(false);
  const [newPass,  setNewPass]  = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  async function handleReset() {
    if (!confirm(`Reset password for ${userEmail}?`)) return;
    setLoading(true);
    const res  = await fetch("/api/admin/security/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setNewPass(data.tempPassword ?? null);
    setLoading(false);
  }

  async function handleCopy() {
    if (!newPass) return;
    await navigator.clipboard.writeText(newPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (newPass) {
    return (
      <div className="flex items-center gap-2">
        <code className="text-xs bg-surface-primary border border-border-primary px-2 py-1 rounded font-mono text-accent-primary">
          {newPass}
        </code>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded border border-border-primary text-text-tertiary hover:text-text-primary transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50"
    >
      {loading ? "Resetting…" : "Reset Password"}
    </button>
  );
}
