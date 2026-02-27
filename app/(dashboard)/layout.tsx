"use client";

import dynamic from "next/dynamic";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Load heavy overlays lazily — only needed on user interaction
const CommandPalette    = dynamic(() => import("@/components/layout/CommandPalette").then(m => ({ default: m.CommandPalette })), { ssr: false });
const NotificationPanel = dynamic(() => import("@/components/layout/NotificationPanel").then(m => ({ default: m.NotificationPanel })), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore();
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen bg-bg-base">
      <Sidebar />
      <Topbar />
      <NotificationPanel />
      <CommandPalette />

      <main
        className={cn(
          "pt-14 min-h-screen transition-all duration-200",
          sidebarCollapsed ? "pl-16" : "pl-[240px]"
        )}
      >
        {/* Mobile warning */}
        <div className="md:hidden flex items-center justify-center min-h-screen p-8 text-center">
          <div>
            <p className="text-text-secondary text-sm">
              Dealerseed is optimized for desktop. Please use a screen width of 1024px or larger.
            </p>
          </div>
        </div>

        {/* Desktop content */}
        <div className="hidden md:block">
          {children}
        </div>
      </main>
    </div>
  );
}
