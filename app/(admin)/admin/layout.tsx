"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogIn,
  Activity,
  Download,
  ShieldCheck,
  ChevronLeft,
  Zap,
  Sun,
  Moon,
} from "lucide-react";

const adminNav = [
  { href: "/admin",             icon: LayoutDashboard, label: "Overview",    exact: true },
  { href: "/admin/accounts",    icon: Users,           label: "Accounts"               },
  { href: "/admin/billing",     icon: CreditCard,      label: "Billing"                },
  { href: "/admin/impersonate", icon: LogIn,           label: "Impersonate"            },
  { href: "/admin/activity",    icon: Activity,        label: "Activity Log"           },
  { href: "/admin/exports",     icon: Download,        label: "Exports"                },
  { href: "/admin/security",    icon: ShieldCheck,     label: "Security"               },
];

function LogoFull({ color = "currentColor" }: { color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" height={28} width={106} fill={color} aria-label="Dehy">
      <path d="M20 4 L8 22 H17 L17 36 L29 18 H20 Z" />
      <text x="38" y="30" fontFamily="Inter, DM Sans, Helvetica Neue, Arial, sans-serif" fontSize="26" fontWeight="600" letterSpacing="-0.5" fill={color}>Dehy</text>
    </svg>
  );
}

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useAppStore();
  const isLight   = theme === "light";

  const iconColor  = (active: boolean) =>
    active ? "var(--accent)" : isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const labelColor = (active: boolean) =>
    active ? "var(--accent)" : isLight ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.65)";
  const subtleColor  = isLight ? "rgba(0,0,0,0.35)"  : "rgba(255,255,255,0.30)";
  const sectionColor = isLight ? "rgba(0,0,0,0.28)"  : "rgba(255,255,255,0.22)";

  async function handleLogout() {
    await fetch("/api/admin-auth", { method: "DELETE" });
    router.push("/admin-login");
  }

  return (
    <div
      data-theme={theme}
      className={cn("min-h-screen transition-colors duration-200")}
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Sidebar */}
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
            <div className="flex items-center gap-2">
              <LogoFull color={isLight ? "#1A2333" : "#FFFFFF"} />
              <span
                className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(0,212,170,0.12)",
                  color:      "var(--accent)",
                  border:     "1px solid rgba(0,212,170,0.20)",
                }}
              >
                Admin
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {!sidebarCollapsed && (
            <p
              className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: sectionColor }}
            >
              Admin Controls
            </p>
          )}
          <ul className="space-y-0.5 px-2">
            {adminNav.map(({ href, icon: Icon, label, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
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

        {/* Bottom controls */}
        <div
          className="border-t py-2 px-2 space-y-0.5 flex-shrink-0"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          {/* Theme toggle */}
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

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "w-full flex items-center gap-3 py-2 rounded text-sm transition-all duration-120 group nav-item",
              sidebarCollapsed ? "justify-center px-2" : "px-3"
            )}
          >
            {sidebarCollapsed
              ? <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: subtleColor }} />
              : <>
                  <ChevronLeft className="w-4 h-4" style={{ color: subtleColor }} />
                  <span className="text-sm" style={{ color: subtleColor }}>Collapse</span>
                </>
            }
            {sidebarCollapsed && <Tooltip label="Expand" />}
          </button>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 py-2 rounded text-sm transition-all duration-120 group nav-item",
              sidebarCollapsed ? "justify-center px-2" : "px-3"
            )}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: subtleColor }} />
            {!sidebarCollapsed && (
              <span className="text-sm" style={{ color: subtleColor }}>Sign out admin</span>
            )}
            {sidebarCollapsed && <Tooltip label="Sign out admin" />}
          </button>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <main
        className={cn(
          "min-h-screen transition-all duration-200",
          sidebarCollapsed ? "pl-16" : "pl-[240px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}
