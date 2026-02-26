"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { Bell, Search, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface AlertCount {
  unread: number;
}

export function Topbar() {
  const { setCommandPaletteOpen, setNotificationsPanelOpen, notificationsPanelOpen } = useAppStore();
  const [currentTime, setCurrentTime]   = useState<Date | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user    = session?.user as Record<string, string> | undefined;
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "??";

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: alertCount } = useQuery<AlertCount>({
    queryKey: ["alert-count"],
    queryFn: async () => {
      const res = await fetch("/api/alerts?unreadOnly=true&pageSize=1");
      const json = await res.json();
      return { unread: json.meta?.total ?? 0 };
    },
    refetchInterval: 30000,
  });

  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-14 bg-bg-panel border-b border-border-default flex items-center px-4 gap-4">
      {/* Spacer for sidebar */}
      <div className="flex-1" />

      {/* Global Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 h-8 bg-bg-base border border-border-default rounded text-sm text-text-tertiary hover:border-border-hover transition-fast group min-w-[200px] max-w-[320px] w-full"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left text-xs">Search deals, counterparties...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-text-disabled bg-bg-hover px-1.5 py-0.5 rounded border border-border-default font-mono">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      {/* Date/Time — only rendered client-side to avoid hydration mismatch */}
      {currentTime && (
        <div className="hidden md:flex flex-col items-end">
          <span className="font-mono text-[11px] text-text-primary">
            {format(currentTime, "HH:mm")}
          </span>
          <span className="font-mono text-[10px] text-text-tertiary">
            {format(currentTime, "MMM d, yyyy")} CT
          </span>
        </div>
      )}

      {/* Notifications */}
      <button
        onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
        className={cn(
          "relative flex items-center justify-center w-8 h-8 rounded border transition-fast",
          notificationsPanelOpen
            ? "bg-bg-card border-accent text-accent"
            : "border-border-default text-text-tertiary hover:border-border-hover hover:text-text-secondary"
        )}
      >
        <Bell className="w-4 h-4" />
        {(alertCount?.unread ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-danger rounded-full text-[9px] font-bold text-white">
            {alertCount!.unread > 9 ? "9+" : alertCount!.unread}
          </span>
        )}
      </button>

      {/* User Menu */}
      <div className="relative pl-2 border-l border-border-default" ref={menuRef}>
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
            {initials}
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs font-medium text-text-primary">{user?.name ?? "User"}</span>
            <span className="text-[10px] text-text-tertiary">{user?.orgName ?? "—"}</span>
          </div>
          <ChevronDown className="w-3 h-3 text-text-tertiary" />
        </button>

        {/* Dropdown */}
        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-bg-card border border-border-default rounded-lg shadow-modal py-1 z-50">
            <div className="px-3 py-2 border-b border-border-default">
              <p className="text-xs font-medium text-text-primary truncate">{user?.email}</p>
              <p className="text-[10px] text-text-tertiary capitalize">{(user?.role ?? "").toLowerCase()} · {user?.orgName}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => setUserMenuOpen(false)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-fast"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-fast"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
