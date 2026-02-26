"use client";

import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Activity } from "@/types";
import {
  MessageSquare, Phone, Mail, Users, ArrowRight, Upload, TrendingUp, Settings
} from "lucide-react";

const ACTIVITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  NOTE: MessageSquare,
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  STAGE_CHANGE: ArrowRight,
  DOCUMENT_UPLOAD: Upload,
  PRICE_UPDATE: TrendingUp,
  SYSTEM: Settings,
};

const ACTIVITY_COLORS: Record<string, string> = {
  NOTE: "text-blue-400 bg-blue-500/10",
  CALL: "text-success bg-success/10",
  EMAIL: "text-accent bg-accent/10",
  MEETING: "text-[#8B5CF6] bg-[#8B5CF6]/10",
  STAGE_CHANGE: "text-warning bg-warning/10",
  DOCUMENT_UPLOAD: "text-text-secondary bg-bg-hover",
  PRICE_UPDATE: "text-success bg-success/10",
  SYSTEM: "text-text-tertiary bg-bg-hover",
};

interface EnrichedActivity extends Omit<Activity, "user" | "deal"> {
  user?: { name: string; avatarUrl: string | null };
  deal?: { dealNumber: string } | null;
}

export function RecentActivity({ activities }: { activities: EnrichedActivity[] }) {
  if (!activities?.length) {
    return <div className="p-6 text-center text-text-tertiary text-xs">No recent activity</div>;
  }

  return (
    <div className="divide-y divide-border-default">
      {activities.map((a) => {
        const Icon = ACTIVITY_ICONS[a.type] ?? MessageSquare;
        const colorClass = ACTIVITY_COLORS[a.type] ?? "text-text-tertiary bg-bg-hover";
        return (
          <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-hover/40 transition-fast">
            <div className={cn("w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-0.5", colorClass)}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs text-text-primary font-medium truncate">{a.title}</p>
                <span className="text-[10px] text-text-disabled flex-shrink-0 font-mono">
                  {formatRelativeTime(a.createdAt)}
                </span>
              </div>
              {a.description && (
                <p className="text-[11px] text-text-tertiary truncate mt-0.5">{a.description}</p>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                {a.deal?.dealNumber && (
                  <span className="text-[10px] text-accent font-mono">{a.deal.dealNumber}</span>
                )}
                {a.user?.name && (
                  <span className="text-[10px] text-text-disabled">{a.user.name}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
