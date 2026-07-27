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

  return (
    <div className="flex h-9 items-center border-b border-border bg-background/50 backdrop-blur-sm">
      <ScrollArea orientation="horizontal" className="flex-1">
        <div className="flex h-9 items-center gap-px px-1">
          {openTabs.map((noteId) => {
            const note = notes.find((n) => n.id === noteId);
            if (!note) return null;

            return (
              <div
                key={noteId}
                className={cn(
                  "group flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors cursor-pointer",
                  activeTab === noteId
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
                onClick={() => setActiveTab(noteId)}
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="max-w-[120px] truncate">{note.title || "Untitled"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(noteId);
                  }}
                  className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-background/50 transition-all"
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
