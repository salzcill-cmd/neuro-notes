"use client";

import { X, FileText } from "lucide-react";
import { useAppStore, useNoteStore } from "@/stores";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TabBar() {
  const openTabs = useAppStore((s) => s.openTabs);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const closeTab = useAppStore((s) => s.closeTab);
  const notes = useNoteStore((s) => s.notes);

  if (openTabs.length === 0) return null;

  const handleSelect = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    setActiveTab(noteId);
    useNoteStore.getState().setCurrentNote(note);
    useAppStore.getState().setCurrentNoteId(noteId);
  };

  return (
    <div className="flex h-8 shrink-0 items-center border-b border-border bg-background">
      <ScrollArea orientation="horizontal" className="flex-1">
        <div className="flex h-8 items-center gap-0.5 px-1.5">
          {openTabs.map((noteId) => {
            const note = notes.find((n) => n.id === noteId);
            if (!note) return null;
            const isActive = activeTab === noteId;

            return (
              <div
                key={noteId}
                className={cn(
                  "group relative flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs cursor-pointer transition-colors",
                  isActive
                    ? "bg-accent/70 text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
                onClick={() => handleSelect(noteId)}
              >
                {note.color && note.color !== "transparent" ? (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: note.color }}
                  />
                ) : (
                  <FileText className="h-3 w-3 shrink-0" />
                )}
                <span className="max-w-[140px] truncate">{note.title || "Untitled"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(noteId);
                  }}
                  className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-background/80 transition-opacity"
                  aria-label={`Close ${note.title}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
