"use client";

import * as React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { ToastContainer } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useAppStore } from "@/stores";
import { useNoteStore } from "@/stores";
import { useTaskStore } from "@/stores";
import { useUIStore } from "@/stores";
import { useMediaQuery } from "@/hooks";
import { cn, generateId } from "@/lib/utils";

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
      if ((e.metaKey || e.ctrlKey) && e.key === "n" && !e.shiftKey) {
        e.preventDefault();
        const now = new Date().toISOString();
        const note = {
          id: generateId(),
          title: "Untitled",
          content: "",
          plainText: "",
          folderId: null,
          workspaceId: "default",
          isPinned: false,
          isFavorite: false,
          isArchived: false,
          isDeleted: false,
          tags: [],
          backlinks: [],
          links: [],
          createdAt: now,
          updatedAt: now,
        };
        useNoteStore.getState().addNote(note);
        useNoteStore.getState().setCurrentNote(note);
        useAppStore.getState().setCurrentNoteId(note.id);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        useAppStore.getState().setActiveView("search");
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        useAppStore.getState().setActiveView("tasks");
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('[placeholder="Add a new task..."]');
          if (input) input.focus();
        }, 100);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
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
