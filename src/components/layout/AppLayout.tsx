"use client";

import * as React from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TabBar } from "@/components/layout/TabBar";
import { StatusBar } from "@/components/layout/StatusBar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { QuickSwitcher } from "@/components/command-palette/QuickSwitcher";
import { ToastContainer } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useAppStore, useNoteStore } from "@/stores";
import { useMediaQuery } from "@/hooks";
import { cn, generateId } from "@/lib/utils";
import { openDailyNote } from "@/lib/dailyNote";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const zenMode = useAppStore((s) => s.zenMode);
  const focusMode = useAppStore((s) => s.focusMode);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const quickSwitcherOpen = useAppStore((s) => s.quickSwitcherOpen);
  const setQuickSwitcherOpen = useAppStore((s) => s.setQuickSwitcherOpen);
  const settings = useAppStore((s) => s.settings);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Brief branded splash while the app boots (no empty flash).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd+K — command palette
      if (mod && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!useAppStore.getState().commandPaletteOpen);
      }
      // Ctrl/Cmd+O — quick switcher
      if (mod && e.key === "o") {
        e.preventDefault();
        setQuickSwitcherOpen(!useAppStore.getState().quickSwitcherOpen);
      }
      // Ctrl/Cmd+D — today's daily note
      if (mod && e.key === "d" && !e.shiftKey) {
        e.preventDefault();
        openDailyNote();
        useAppStore.getState().setActiveView("notes");
      }
      // Ctrl/Cmd+N — new note
      if (mod && e.key === "n" && !e.shiftKey) {
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
      // Ctrl/Cmd+Shift+F — search view
      if (mod && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        useAppStore.getState().setActiveView("search");
      }
      // Ctrl/Cmd+Shift+T — tasks view
      if (mod && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        useAppStore.getState().setActiveView("tasks");
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('[placeholder="Add a new task..."]');
          if (input) input.focus();
        }, 100);
      }
      // Ctrl/Cmd+Shift+Z — zen mode
      if (mod && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        const app = useAppStore.getState();
        app.setZenMode(!app.zenMode);
      }
      // Escape — close overlays / exit zen
      if (e.key === "Escape") {
        const app = useAppStore.getState();
        if (app.quickSwitcherOpen) {
          setQuickSwitcherOpen(false);
        } else if (app.commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (app.zenMode) {
          app.setZenMode(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen, setQuickSwitcherOpen]);

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion={settings.reducedMotion ? "always" : "user"}>
        <AnimatePresence>
          {!mounted && (
            <motion.div
              key="boot-splash"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-lg"
              >
                N
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="text-sm font-medium text-muted-foreground"
              >
                NeuroNotes
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
          {!zenMode && !focusMode && (isMobile ? <MobileSidebar /> : <Sidebar />)}

          <div className="flex flex-1 flex-col overflow-hidden">
            {!zenMode && !focusMode && <Topbar />}

            {!zenMode && !focusMode && <TabBar />}

            <main className="flex-1 overflow-hidden">{children}</main>

            {!zenMode && !focusMode && <StatusBar />}
          </div>

          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
          <QuickSwitcher open={quickSwitcherOpen} onOpenChange={setQuickSwitcherOpen} />

          <ToastContainer />
        </div>
      </MotionConfig>
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
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-9 left-2 z-40 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-popover shadow-lg lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
