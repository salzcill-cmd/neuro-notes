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
  Settings,
  Plus,
  StickyNote,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useAppStore, useNoteStore, useUIStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";
import { openDailyNote } from "@/lib/dailyNote";
import type { Note } from "@/types";

export function Topbar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const zenMode = useAppStore((s) => s.zenMode);
  const setZenMode = useAppStore((s) => s.setZenMode);
  const addNote = useNoteStore((s) => s.addNote);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);

  const handleNewNote = () => {
    const now = new Date().toISOString();
    const note: Note = {
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
    addNote(note);
    setCurrentNote(note);
    setCurrentNoteId(note.id);
  };

  const toggleTheme = () => {
    const next = settings.theme === "dark" ? "light" : "dark";
    setSettings({ theme: next });
  };

  return (
    <header className="flex h-11 shrink-0 items-center gap-1.5 border-b border-border bg-background px-2.5">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5",
          "text-[13px] text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
          "w-full max-w-sm"
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search or jump to...</span>
        <kbd className="kbd hidden sm:inline-flex">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-0.5">
        <Tooltip content="Daily Note" shortcut="Ctrl+D">
          <Button variant="ghost" size="icon-sm" onClick={() => { openDailyNote(); setActiveView("notes"); }} aria-label="Daily Note">
            <StickyNote className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content="New Note" shortcut="Ctrl+N">
          <Button variant="ghost" size="icon-sm" onClick={handleNewNote} aria-label="New Note">
            <Plus className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content={settings.theme === "dark" ? "Light Mode" : "Dark Mode"}>
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
            {settings.theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content={zenMode ? "Exit Zen Mode" : "Zen Mode"} shortcut="Ctrl+Shift+Z">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setZenMode(!zenMode)}
            aria-label="Toggle zen mode"
          >
            {zenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </Tooltip>

        <Tooltip content="Note panel">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            aria-label="Toggle note panel"
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </Tooltip>

        <Tooltip content="Settings">
          <Button variant="ghost" size="icon-sm" onClick={() => setActiveView("settings")} aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
