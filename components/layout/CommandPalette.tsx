"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useAppStore } from "@/store/app-store";
import { Search, GitPullRequest, Building2, FileText, LayoutDashboard, TrendingUp, BarChart3, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "deal" | "counterparty" | "contract";
  title: string;
  subtitle: string;
  href: string;
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setCommandPaletteOpen]);

  // Search
  useEffect(() => {
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}&limit=8`);
        const data = await res.json();
        setResults(data.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const onSelect = useCallback((href: string) => {
    setCommandPaletteOpen(false);
    setSearch("");
    router.push(href);
  }, [router, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-bg-card border border-border-hover rounded-md shadow-modal overflow-hidden animate-fade-in">
        <Command className="bg-transparent" shouldFilter={false}>
          <div className="flex items-center gap-3 px-4 border-b border-border-default">
            <Search className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search deals, counterparties, contracts..."
              className="flex-1 py-3 bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none"
              autoFocus
            />
            <kbd className="text-[10px] text-text-disabled bg-bg-hover px-1.5 py-0.5 rounded border border-border-default font-mono">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto py-2">
            {loading && (
              <div className="px-4 py-8 text-center text-text-tertiary text-sm">
                <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-2" />
                Searching...
              </div>
            )}

            {!loading && search.length >= 2 && results.length === 0 && (
              <Command.Empty className="px-4 py-8 text-center text-text-tertiary text-sm">
                No results for &quot;{search}&quot;
              </Command.Empty>
            )}

            {results.length > 0 && (
              <Command.Group heading="" className="[&_[cmdk-group-heading]]:hidden">
                <div className="px-3 pb-1">
                  <p className="text-[10px] text-text-disabled uppercase tracking-wider">Results</p>
                </div>
                {results.map((r) => (
                  <Command.Item
                    key={r.id}
                    value={r.id}
                    onSelect={() => onSelect(r.href)}
                    className="flex items-center gap-3 px-3 py-2 mx-1 rounded cursor-pointer aria-selected:bg-bg-hover transition-fast"
                  >
                    <ResultIcon type={r.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{r.title}</p>
                      <p className="text-xs text-text-tertiary truncate">{r.subtitle}</p>
                    </div>
                    <TypeBadge type={r.type} />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick actions */}
            <Command.Group>
              <div className="px-3 pt-2 pb-1">
                <p className="text-[10px] text-text-disabled uppercase tracking-wider">Quick Actions</p>
              </div>
              {quickActions.map((action) => (
                <Command.Item
                  key={action.href}
                  value={action.label}
                  onSelect={() => onSelect(action.href)}
                  className="flex items-center gap-3 px-3 py-2 mx-1 rounded cursor-pointer aria-selected:bg-bg-hover transition-fast"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded bg-bg-hover">
                    <action.icon className="w-3.5 h-3.5 text-text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary">{action.label}</p>
                    <p className="text-xs text-text-tertiary">{action.description}</p>
                  </div>
                  {action.shortcut && (
                    <kbd className="text-[10px] text-text-disabled font-mono">{action.shortcut}</kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  const iconClass = "w-3.5 h-3.5";
  const wrapClass = "w-7 h-7 flex items-center justify-center rounded";

  if (type === "deal") return (
    <div className={cn(wrapClass, "bg-blue-500/10")}>
      <GitPullRequest className={cn(iconClass, "text-blue-400")} />
    </div>
  );
  if (type === "counterparty") return (
    <div className={cn(wrapClass, "bg-accent/10")}>
      <Building2 className={cn(iconClass, "text-accent")} />
    </div>
  );
  return (
    <div className={cn(wrapClass, "bg-warning/10")}>
      <FileText className={cn(iconClass, "text-warning")} />
    </div>
  );
}

function TypeBadge({ type }: { type: SearchResult["type"] }) {
  const labels: Record<SearchResult["type"], string> = {
    deal: "Deal",
    counterparty: "CP",
    contract: "Contract",
  };
  return (
    <span className="text-[10px] text-text-tertiary bg-bg-hover px-1.5 py-0.5 rounded">
      {labels[type]}
    </span>
  );
}

const quickActions = [
  { href: "/deals/new", icon: Plus, label: "Create New Deal", description: "Open deal creation form", shortcut: "N" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Go to Dashboard", description: "", shortcut: "G D" },
  { href: "/deals", icon: GitPullRequest, label: "Go to Deals", description: "", shortcut: "G T" },
  { href: "/counterparties", icon: Building2, label: "Go to Counterparties", description: "", shortcut: "G C" },
  { href: "/market", icon: TrendingUp, label: "Market Data", description: "", shortcut: "G M" },
  { href: "/reports", icon: BarChart3, label: "Reports", description: "", shortcut: "G R" },
  { href: "/settings", icon: Settings, label: "Settings", description: "", shortcut: null },
];
