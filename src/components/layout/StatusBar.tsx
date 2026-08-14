"use client";

import * as React from "react";
import { Check, Command, FileText, Type } from "lucide-react";
import { useNoteStore, useAppStore } from "@/stores";
import { FocusTimer } from "@/components/layout/FocusTimer";
import { cn } from "@/lib/utils";

/**
 * Obsidian-style status bar: live word count for the open note, vault size,
 * and a "saved" indicator fed by the store's lastSavedAt timestamp.
 */
export function StatusBar() {
  const notes = useNoteStore((s) => s.notes);
  const currentNote = useNoteStore((s) => s.currentNote);
  const lastSavedAt = useNoteStore((s) => s.lastSavedAt);
  const activeView = useAppStore((s) => s.activeView);
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);

  const [savedVisible, setSavedVisible] = React.useState(false);
  const [clock, setClock] = React.useState(() => new Date());

  const wordCount = currentNote
    ? (currentNote.plainText?.split(/\s+/).filter(Boolean).length || 0)
    : null;
  const totalNotes = notes.filter((n) => !n.isDeleted && !n.isArchived).length;

  // Flash the "Saved" indicator whenever the store timestamp changes
  // (render-phase adjustment with a prev-state tracker, then a timer to hide it).
  const [prevSavedAt, setPrevSavedAt] = React.useState(lastSavedAt);
  if (prevSavedAt !== lastSavedAt) {
    setPrevSavedAt(lastSavedAt);
    if (lastSavedAt) setSavedVisible(true);
  }

  React.useEffect(() => {
    if (!savedVisible) return;
    const t = setTimeout(() => setSavedVisible(false), 1600);
    return () => clearTimeout(t);
  }, [savedVisible]);

  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const time = clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <footer className="flex h-6 shrink-0 items-center gap-3 border-t border-border bg-background px-3 text-[11px] text-muted-foreground select-none">
      <div className="flex items-center gap-1.5">
        {wordCount !== null ? (
          <>
            <Type className="h-3 w-3" />
            <span>
              {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
            </span>
          </>
        ) : (
          <>
            <FileText className="h-3 w-3" />
            <span>
              {totalNotes} {totalNotes === 1 ? "note" : "notes"}
            </span>
          </>
        )}
      </div>

      {activeView && (
        <span className="hidden sm:inline capitalize">{activeView.replace(/-/g, " ")}</span>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span
          className={cn(
            "flex items-center gap-1 transition-opacity duration-300",
            savedVisible ? "opacity-100 text-emerald-500" : "opacity-40"
          )}
        >
          <Check className="h-3 w-3" />
          Saved
        </span>
        <FocusTimer />
        <span className="tabular-nums hidden sm:inline">{time}</span>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1 rounded px-1 py-0.5 hover:bg-accent hover:text-foreground transition-colors"
        >
          <Command className="h-3 w-3" />
          <span className="hidden md:inline">Commands</span>
        </button>
      </div>
    </footer>
  );
}


