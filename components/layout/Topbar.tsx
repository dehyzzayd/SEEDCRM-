"use client";

import { useState, useEffect }          from "react";
import { useSession }                   from "next-auth/react";
import { useAppStore }                  from "@/store/app-store";
import { Bell, Search, Clock, AlertTriangle, DollarSign, Users, CheckCircle, X } from "lucide-react";
import { cn }                           from "@/lib/utils";
import { useQuery }                     from "@tanstack/react-query";

interface Alert {
  id: string; type: string; title: string; message: string;
  severity: string; isRead: boolean; createdAt: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-danger",
  WARNING:  "text-warning",
  INFO:     "text-blue-400",
};

const SEVERITY_BG: Record<string, string> = {
  CRITICAL: "bg-danger/10",
  WARNING:  "bg-warning/10",
  INFO:     "bg-blue-500/10",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  VEHICLE_AGING:     AlertTriangle,
  DEAL_STALE:        Clock,
  FOLLOW_UP_DUE:     Users,
  FINANCE_EXPIRING:  DollarSign,
  CUSTOM:            Bell,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function Topbar() {
  const { data: session }                        = useSession();
const { notificationPanelOpen, setNotificationPanelOpen, sidebarCollapsed, setCommandPaletteOpen } = useAppStore();
  const [now, setNow]                            = useState("");

  // Clock
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) +
        " · " + d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Alerts count
  const { data: alertData } = useQuery<{ total: number; alerts: Alert[] }>({
    queryKey: ["dealer-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts?unreadOnly=true&pageSize=10");
      if (!res.ok) return { total: 0, alerts: [] };
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const unread  = alertData?.total ?? 0;
  const alerts  = alertData?.alerts ?? [];

  const initials = session?.user?.name
    ?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-40 h-14 flex items-center justify-between px-4 border-b transition-all duration-200",
        )}
        style={{
          left: sidebarCollapsed ? "4rem" : "240px",
          background: "var(--bg-topbar)",
          borderColor: "var(--sidebar-border)",
        }}
      >
        {/* Left — page clock */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-tertiary hidden sm:block">{now}</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {/* Search trigger */}
          <button
  onClick={() => setCommandPaletteOpen(true)}
  className="flex items-center gap-2 h-8 px-3 rounded border text-xs transition-colors"
  style={{
    background:  "var(--bg-topbar)",
    borderColor: "var(--border-default)",
    color:       "var(--text-tertiary)",
  }}
  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
>
  <Search className="w-3 h-3" />
  <span className="hidden md:block">Search…</span>
  <kbd
    className="hidden md:block text-[10px] px-1 py-0.5 rounded"
    style={{
      background:  "var(--bg-hover)",
      border:      "1px solid var(--border-default)",
      color:       "var(--text-tertiary)",
    }}
  >
    ⌘K
  </kbd>
</button>

          {/* Notifications */}
          <button
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
            className="relative p-2 rounded hover:bg-bg-hover transition-colors text-text-tertiary"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-border-default">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-[11px] font-bold text-accent">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-text-primary leading-none">{session?.user?.name ?? "—"}</p>
              <p className="text-[10px] text-text-tertiary mt-0.5 leading-none">
                {(session?.user as { orgName?: string })?.orgName ?? ""}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Notification Panel ── */}
      {notificationPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setNotificationPanelOpen(false)}
        >
          <div
            className="w-[380px] bg-bg-base border-l border-border-default h-full overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
              <div>
                <p className="text-sm font-semibold text-text-primary">Notifications</p>
                {unread > 0 && (
                  <p className="text-xs text-text-tertiary">{unread} unread</p>
                )}
              </div>
              <button onClick={() => setNotificationPanelOpen(false)} className="p-1 rounded hover:bg-bg-hover text-text-tertiary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <CheckCircle className="w-8 h-8 text-success opacity-50" />
                  <p className="text-sm text-text-tertiary">All caught up!</p>
                  <p className="text-xs text-text-disabled">No unread notifications</p>
                </div>
              ) : (
                <div>
                  {alerts.map(alert => {
                    const Icon = TYPE_ICONS[alert.type] ?? Bell;
                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 border-b border-border-default/40 hover:bg-bg-hover/30 transition-colors",
                          !alert.isRead && "bg-accent/3"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                          SEVERITY_BG[alert.severity] ?? "bg-bg-panel"
                        )}>
                          <Icon className={cn("w-3.5 h-3.5", SEVERITY_COLORS[alert.severity] ?? "text-text-tertiary")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-text-primary">{alert.title}</p>
                          <p className="text-[11px] text-text-tertiary leading-relaxed mt-0.5 line-clamp-2">{alert.message}</p>
                          <p className="text-[10px] text-text-disabled mt-1">{timeAgo(alert.createdAt)}</p>
                        </div>
                        {!alert.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Static dealer alerts when no DB alerts exist */}
            {alerts.length === 0 && (
              <div className="border-t border-border-default p-3">
                <p className="text-[10px] text-text-tertiary text-center">
                  Alerts will appear here for aging inventory, stale deals, and follow-ups
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
