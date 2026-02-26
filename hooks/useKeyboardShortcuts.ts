"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    let gPressed = false;
    let gTimer: ReturnType<typeof setTimeout>;

    const handler = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // N → New deal
      if (e.key === "n" && !e.metaKey && !e.ctrlKey) {
        router.push("/deals/new");
        return;
      }

      // Cmd+K or / → Command palette
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // G + key combos
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { gPressed = false; }, 1000);
        return;
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(gTimer);
        switch (e.key.toLowerCase()) {
          case "d": router.push("/dashboard"); break;
          case "t": router.push("/deals"); break;
          case "c": router.push("/counterparties"); break;
          case "n": router.push("/contracts"); break;
          case "m": router.push("/market"); break;
          case "r": router.push("/reports"); break;
          case "s": router.push("/settings"); break;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      clearTimeout(gTimer);
    };
  }, [router, setCommandPaletteOpen]);
}
