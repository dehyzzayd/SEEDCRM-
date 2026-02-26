"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function ExportButton({ exportId }: { exportId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const res  = await fetch(`/api/admin/exports?type=${exportId}`);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `dehy_${exportId}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50"
    >
      <Download className="w-3.5 h-3.5" />
      {loading ? "Exporting…" : "Download CSV"}
    </button>
  );
}
