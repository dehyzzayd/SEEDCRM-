"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatRelativeTime } from "@/lib/utils";
import { X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alert } from "@/types";

export function NotificationPanel() {
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useAppStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery<{ data: Alert[] }>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts?pageSize=20");
      return res.json();
    },
    enabled: notificationsPanelOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await fetch(`/api/alerts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [alertId] }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert-count"] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const ids = data?.data.filter(a => !a.isRead).map(a => a.id) ?? [];
      if (ids.length === 0) return;
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert-count"] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotificationsPanelOpen(false);
      }
    };
    if (notificationsPanelOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [notificationsPanelOpen, setNotificationsPanelOpen]);

  if (!notificationsPanelOpen) return null;

  const alerts = data?.data ?? [];
  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div
      ref={panelRef}
      className="fixed top-14 right-4 z-50 w-96 bg-bg-card border border-border-hover rounded-md shadow-modal animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <span className="badge bg-danger/15 text-danger">{unreadCount} new</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="text-xs text-accent hover:text-accent/80 transition-fast"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={() => setNotificationsPanelOpen(false)}
            className="text-text-tertiary hover:text-text-secondary transition-fast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts list */}
      <div className="max-h-[480px] overflow-y-auto divide-y divide-border-default">
        {alerts.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-text-tertiary">No notifications</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onMarkRead={() => markReadMutation.mutate(alert.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function AlertItem({ alert, onMarkRead }: { alert: Alert; onMarkRead: () => void }) {
  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3 transition-fast cursor-pointer",
        !alert.isRead ? "bg-bg-hover/30 hover:bg-bg-hover" : "hover:bg-bg-hover/20",
      )}
      onClick={onMarkRead}
    >
      <div className="flex-shrink-0 mt-0.5">
        <SeverityIcon severity={alert.severity} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-xs font-medium", alert.isRead ? "text-text-secondary" : "text-text-primary")}>
            {alert.title}
          </p>
          {!alert.isRead && (
            <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1" />
          )}
        </div>
        <p className="text-[11px] text-text-tertiary mt-0.5 line-clamp-2">{alert.message}</p>
        <p className="text-[10px] text-text-disabled mt-1">{formatRelativeTime(alert.createdAt)}</p>
      </div>
    </div>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "CRITICAL") return (
    <div className="w-6 h-6 rounded bg-danger/10 flex items-center justify-center">
      <AlertCircle className="w-3.5 h-3.5 text-danger" />
    </div>
  );
  if (severity === "WARNING") return (
    <div className="w-6 h-6 rounded bg-warning/10 flex items-center justify-center">
      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
    </div>
  );
  return (
    <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center">
      <Info className="w-3.5 h-3.5 text-blue-400" />
    </div>
  );
}
