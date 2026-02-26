import type { Config } from "tailwindcss";

const config: Config = {
  // No darkMode class strategy needed — we handle themes via data-theme CSS vars
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Theme-aware via CSS custom properties ──────────────────
        "bg-base":   "var(--bg-base)",
        "bg-panel":  "var(--bg-panel)",
        "bg-card":   "var(--bg-card)",
        "bg-hover":  "var(--bg-hover)",

        /* Sidebar-specific bg tokens (differ from page bg) */
        "sidebar-bg":     "var(--sidebar-bg)",
        "sidebar-border": "var(--sidebar-border)",

        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary":  "var(--text-tertiary)",
        "text-disabled":  "var(--text-disabled)",

        "border-default": "var(--border-default)",
        "border-hover":   "var(--border-hover)",
        "border-focus":   "var(--border-focus)",

        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--bg-base)",
        },

        // ── Static semantic colours (same in both themes) ──────────
        danger:  { DEFAULT: "#EF4444", muted: "rgba(239,68,68,0.15)" },
        success: { DEFAULT: "#10B981", muted: "rgba(16,185,129,0.15)" },
        warning: { DEFAULT: "#F59E0B", muted: "rgba(245,158,11,0.15)" },

        // ── Chart palette ──────────────────────────────────────────
        "chart-1": "#00D4AA",
        "chart-2": "#3B82F6",
        "chart-3": "#8B5CF6",
        "chart-4": "#F59E0B",
        "chart-5": "#EF4444",
        "chart-6": "#EC4899",

        // ── Shadcn compat ──────────────────────────────────────────
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        card: { DEFAULT: "var(--bg-card)", foreground: "var(--text-primary)" },
        popover: { DEFAULT: "var(--bg-card)", foreground: "var(--text-primary)" },
        primary: { DEFAULT: "var(--accent)", foreground: "var(--bg-base)" },
        secondary: { DEFAULT: "var(--bg-panel)", foreground: "var(--text-secondary)" },
        muted: { DEFAULT: "var(--bg-hover)", foreground: "var(--text-tertiary)" },
        destructive: { DEFAULT: "#EF4444", foreground: "#F1F5F9" },
        border: "var(--border-default)",
        input:  "var(--bg-panel)",
        ring:   "var(--accent)",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
        xs:   ["12px", { lineHeight: "16px" }],
        sm:   ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "20px" }],
        lg:   ["16px", { lineHeight: "24px" }],
        xl:   ["20px", { lineHeight: "28px" }],
        "2xl":["28px", { lineHeight: "36px" }],
      },
      spacing: {
        sidebar: "240px",
        "sidebar-collapsed": "64px",
        topbar: "56px",
      },
      borderRadius: {
        sm:  "4px",
        DEFAULT: "6px",
        md:  "8px",
        lg:  "10px",
        xl:  "12px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.12)",
        focus: "0 0 0 2px rgba(0,212,170,0.15)",
        modal: "0 25px 50px rgba(0,0,0,0.4)",
      },
      transitionDuration: { fast: "120ms" },
      transitionTimingFunction: { snappy: "cubic-bezier(0.16, 1, 0.3, 1)" },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        "toast-slide-in": {
          from: { transform: "translateX(calc(100% + 1rem))" },
          to:   { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        shimmer:           "shimmer 1.5s infinite linear",
        "slide-in-right":  "slide-in-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-slide-in":  "toast-slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-in":         "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
