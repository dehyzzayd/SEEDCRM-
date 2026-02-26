import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";
type DealViewMode = "table" | "kanban";

interface AppState {
  sidebarCollapsed: boolean;
  theme: Theme;
  commandPaletteOpen: boolean;
  notificationPanelOpen: boolean;
  dealViewMode: DealViewMode;
  dealFilters: Record<string, unknown>;

  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setCommandPaletteOpen: (v: boolean) => void;
  setNotificationPanelOpen: (v: boolean) => void;
  setDealViewMode: (v: DealViewMode) => void;
  setDealFilters: (f: Record<string, unknown>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "dark",
      commandPaletteOpen: false,
      notificationPanelOpen: false,
      dealViewMode: "table",
      dealFilters: {},

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      // ✅ was missing — sidebar collapse button calls this
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        document.documentElement.className = next;
        set({ theme: next });
      },

      setTheme: (t) => {
        document.documentElement.setAttribute("data-theme", t);
        document.documentElement.className = t;
        set({ theme: t });
      },

      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setNotificationPanelOpen: (v) => set({ notificationPanelOpen: v }),
      setDealViewMode: (v) => set({ dealViewMode: v }),
      setDealFilters: (f) => set({ dealFilters: f }),
    }),
    {
      name: "dehy-app-store",
      // ✅ correct key is "partialize" not "partialState"
      partialize: (s) => ({
        theme:            s.theme,
        sidebarCollapsed: s.sidebarCollapsed,
        dealViewMode:     s.dealViewMode,
      }),
    }
  )
);
