"use client";

import { SessionProvider }                        from "next-auth/react";
import { QueryClient, QueryClientProvider }       from "@tanstack/react-query";
import { useEffect, useRef }                      from "react";
import { useAppStore }                            from "@/store/app-store";

function ThemeInitializer() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.className = theme;
  }, [theme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // useRef so the QueryClient is stable across re-renders
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime:        60 * 1000,   // 1 min
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClientRef.current}>
        <ThemeInitializer />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
