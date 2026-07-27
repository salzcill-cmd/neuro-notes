"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { ToastContainer } from "@/components/ui/toast";
import { useAppStore } from "@/stores";
import { useMediaQuery } from "@/hooks";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const zenMode = useAppStore((s) => s.zenMode);
  const focusMode = useAppStore((s) => s.focusMode);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const isMobile = useMediaQuery("(max-width: 768px)");

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!useAppStore.getState().commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {!zenMode && !focusMode && (
        <>
          {isMobile ? (
            <MobileSidebar />
          ) : (
            <Sidebar />
          )}
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {!zenMode && !focusMode && <Topbar />}

        <main
          className={cn(
            "flex-1 overflow-hidden transition-all duration-300",
            zenMode && "pt-0",
            focusMode && "pt-0"
          )}
        >
          {children}
        </main>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      <ToastContainer />
    </div>
  );
}

function MobileSidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar />
      </div>
    </>
  );
}
