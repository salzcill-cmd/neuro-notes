"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

/**
 * Global right-click context menu. Renders whatever `useUIStore.contextMenu`
 * holds (position + items) and closes on outside click / Escape / scroll.
 * Mount once in the app shell.
 */
export function ContextMenu() {
  const contextMenu = useUIStore((s) => s.contextMenu);
  const setContextMenu = useUIStore((s) => s.setContextMenu);

  React.useEffect(() => {
    if (!contextMenu) return;

    const close = () => setContextMenu(null);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    // A small delay lets the initial right-click event finish before we
    // listen for outside clicks (otherwise the menu closes instantly).
    const t = setTimeout(() => {
      window.addEventListener("mousedown", close, true);
      window.addEventListener("keydown", onKeyDown, true);
      window.addEventListener("blur", close);
      window.addEventListener("resize", close);
      window.addEventListener("scroll", close, true);
    }, 0);

    return () => {
      clearTimeout(t);
      window.removeEventListener("mousedown", close, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [contextMenu, setContextMenu]);

  // Clamp so the menu never spills off-screen.
  const x = contextMenu
    ? Math.min(contextMenu.x, (typeof window !== "undefined" ? window.innerWidth : 0) - 200)
    : 0;
  const y = contextMenu
    ? Math.min(contextMenu.y, (typeof window !== "undefined" ? window.innerHeight : 0) - 80)
    : 0;

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          style={{ left: x, top: y }}
          className="fixed z-[80] min-w-[180px] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md"
          onContextMenu={(e) => e.preventDefault()}
        >
          {contextMenu.items.map((item, i) =>
            item.separator ? (
              <div key={i} className="my-1 h-px bg-border" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.action?.();
                  setContextMenu(null);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-[13px] outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  item.danger &&
                    "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto text-[11px] font-mono text-muted-foreground">
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
