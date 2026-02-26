"use client";

import { useRouter } from "next/navigation";

export function AdminLogout() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin-auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs px-3 py-1.5 rounded-md border border-border-primary text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-colors"
    >
      Sign out admin
    </button>
  );
}
