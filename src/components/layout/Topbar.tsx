"use client";

import * as React from "react";
import {
  Search,
  Menu,
  Command,
  PanelRightOpen,
  PanelRightClose,
  Moon,
  Sun,
  Bell,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useAppStore, useNoteStore, useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

export function Topbar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const currentNote = useNoteStore((s) => s.currentNote);

  const toggleTheme = () => {
    const next = settings.theme === "dark" ? "light" : "dark";
    setSettings({ theme: next });
  };

  return (
    <header className="flex h-12 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-3 shrink-0">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="shrink-0"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1 flex items-center">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5",
            "text-sm text-muted-foreground hover:bg-muted transition-colors",
            "w-full max-w-md"
          )}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left">Search or jump to...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <Tooltip content="New Note" shortcut="Ctrl+N">
          <Button variant="ghost" size="icon-sm">
            <Plus className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Notifications">
          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </Tooltip>

        <Tooltip content={settings.theme === "dark" ? "Light Mode" : "Dark Mode"}>
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
            {settings.theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Properties">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Settings">
          <Button variant="ghost" size="icon-sm">
            <Settings className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
