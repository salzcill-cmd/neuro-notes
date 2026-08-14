"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CornerDownLeft, Plus, ArrowUp, ArrowDown, Hash, StickyNote } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore, useNoteStore, useWorkspaceStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";
import type { Note } from "@/types";

interface QuickSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Obsidian-style quick switcher (Ctrl/Cmd+O): jump to any note by typing
 * part of its name. Press Enter to open, or to create a new note with the
 * typed title when nothing matches.
 */
export function QuickSwitcher({ open, onOpenChange }: QuickSwitcherProps) {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset state when the switcher opens (render-phase adjustment, no effect).
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setSelectedIndex(0);
    }
  }

  // Reset the highlighted row whenever the query changes.
  const [prevQuery, setPrevQuery] = React.useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  const notes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const candidates = React.useMemo(() => {
    const active = notes.filter((n) => !n.isDeleted && !n.isArchived);
    const sorted = [...active].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (!query.trim()) return sorted.slice(0, 12);
    const lower = query.toLowerCase();
    return sorted.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.plainText?.toLowerCase().includes(lower)
    );
  }, [notes, query]);

  const exactMatch = candidates.some(
    (n) => n.title.toLowerCase() === query.trim().toLowerCase()
  );
  const canCreate = query.trim().length > 0 && !exactMatch;

  const openNote = (note: Note) => {
    useNoteStore.getState().setCurrentNote(note);
    useAppStore.getState().setCurrentNoteId(note.id);
    useAppStore.getState().openTab(note.id);
    onOpenChange(false);
  };

  const createNote = (title: string) => {
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: title.trim(),
      content: "",
      plainText: "",
      folderId: null,
      workspaceId: currentWorkspace?.id || "default",
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
    openNote(note);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, candidates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (canCreate) {
        createNote(query);
      } else {
        const target = candidates[selectedIndex];
        if (target) openNote(target);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  React.useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[18vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-popover shadow-2xl"
              onKeyDown={handleKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jump to a note..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="kbd hidden sm:inline-flex">ESC</kbd>
              </div>

              <ScrollArea ref={listRef} className="max-h-[320px]">
                {candidates.length === 0 && !canCreate ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No notes found
                  </div>
                ) : (
                  <div className="p-1">
                    {canCreate && (
                      <button
                        onClick={() => createNote(query)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent/60 transition-colors text-left"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">Create note &quot;{query.trim()}&quot;</div>
                          <div className="text-xs text-muted-foreground">Press Enter to create</div>
                        </div>
                        <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      </button>
                    )}
                    {candidates.map((note, index) => (
                      <button
                        key={note.id}
                        data-index={index}
                        onClick={() => openNote(note)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-left",
                          index === selectedIndex
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-accent/50"
                        )}
                      >
                        {note.icon ? (
                          <span className="text-base shrink-0">{note.icon}</span>
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{note.title || "Untitled"}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {note.plainText?.slice(0, 70) || "Empty note"}
                          </div>
                        </div>
                        {note.tags.length > 0 && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                            <Hash className="h-3 w-3" />
                            {note.tags[0].name}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" />
                  Open / Create
                </span>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground/70">
                  <StickyNote className="h-3 w-3" />
                  {notes.filter((n) => !n.isDeleted).length} notes
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
