"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  LayoutDashboard,
  GitPullRequest,
  Building2,
  FileText,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
} from "lucide-react";

function LogoFull({ color = "currentColor" }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" height={30} width={120} fill={color} aria-label="Dehy">
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />
      <text x="38" y="30" fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif" fontSize="26" fontWeight="600" letterSpacing="-0.5" fill={color}>Dehy</text>
    </svg>
  );
}

const navItems = [
  { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"      },
  { href: "/deals",          icon: GitPullRequest,  label: "Deals"          },
  { href: "/counterparties", icon: Building2,       label: "Counterparties" },
  { href: "/contracts",      icon: FileText,        label: "Contracts"      },
  { href: "/market",         icon: TrendingUp,      label: "Market Data"    },
  { href: "/reports",        icon: BarChart3,       label: "Reports"        },
];

function Tooltip({ label }: { label: string }) {
  return (
    <span
      className="absolute left-full ml-3 px-2.5 py-1.5 rounded text-xs whitespace-nowrap
                 opacity-0 group-hover:opacity-100 transition-opacity duration-120
                 pointer-events-none z-50 shadow-lg"
      style={{
        background: "var(--bg-hover)",
        color:      "var(--text-primary)",
        border:     "1px solid var(--border-hover)",
      }}
    >
      {label}
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useAppStore();
  const isLight = theme === "light";

  const iconColor    = (active: boolean) =>
    active ? "var(--accent)" : isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const labelColor   = (active: boolean) =>
    active ? "var(--accent)" : isLight ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.65)";
  const subtleColor  = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.30)";
  const sectionColor = isLight ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.22)";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-50 flex flex-col border-r transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-[240px]"
      )}
      style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center border-b h-14 flex-shrink-0 px-3"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        {sidebarCollapsed ? (
          <Zap style={{ width: 22, height: 22, color: isLight ? "#1A2333" : "#FFFFFF", flexShrink: 0 }} />
        ) : (
          <LogoFull color={isLight ? "#1A2333" : "#FFFFFF"} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {!sidebarCollapsed && (
          <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest"
             style={{ color: sectionColor }}>
            Navigation
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 py-2 rounded text-sm transition-all duration-120 group relative",
                    sidebarCollapsed ? "justify-center px-2" : "px-3",
                    active ? "nav-item-active" : "nav-item"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: iconColor(active) }} />
                  {!sidebarCollapsed && (
                    <span className="text-sm" style={{ color: labelColor(active), fontWeight: active ? 500 : 400 }}>
                      {label}
                    </span>
                  )}
                  {sidebarCollapsed && <Tooltip label={label} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t py-2 px-2 space-y-0.5 flex-shrink-0"
           style={{ borderColor: "var(--sidebar-border)" }}>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 py-2 rounded text-sm transition-all duration-120 group relative",
            sidebarCollapsed ? "justify-center px-2" : "px-3",
            pathname.startsWith("/settings") ? "nav-item-active" : "nav-item"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0"
                    style={{ color: iconColor(pathname.startsWith("/settings")) }} />
          {!sidebarCollapsed && (
            <span className="text-sm" style={{ color: labelColor(pathname.startsWith("/settings")) }}>
              Settings
            </span>
          )}
          {sidebarCollapsed && <Tooltip label="Settings" />}
        </Link>

        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center gap-3 py-2 rounded text-sm transition-all duration-120 group relative nav-item",
            sidebarCollapsed ? "justify-center px-2" : "px-3"
          )}
        >
          {isLight
            ? <Moon className="w-4 h-4 flex-shrink-0" style={{ color: subtleColor }} />
            : <Sun  className="w-4 h-4 flex-shrink-0" style={{ color: subtleColor }} />
          }
          {!sidebarCollapsed && (
            <span className="text-sm" style={{ color: subtleColor }}>
              {isLight ? "Dark Mode" : "Light Mode"}
            </span>
          )}
          {sidebarCollapsed && <Tooltip label={isLight ? "Dark Mode" : "Light Mode"} />}
        </button>

        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full flex items-center gap-3 py-2 rounded text-sm transition-all duration-120 group nav-item",
            sidebarCollapsed ? "justify-center px-2" : "px-3"
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" style={{ color: subtleColor }} />
            : <>
                <ChevronLeft className="w-4 h-4" style={{ color: subtleColor }} />
                <span className="text-sm" style={{ color: subtleColor }}>Collapse</span>
              </>
          }
        </button>
      </div>
    </aside>
  );
}
