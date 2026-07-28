"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  Tag,
  Trash2,
  Copy,
  Archive,
  Link2,
  Share2,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { useNoteStore, useAppStore, useUIStore } from "@/stores";
import { cn, formatDate, formatDateTime, calculateReadingTime, generateId } from "@/lib/utils";

export function NoteEditorView() {
  const currentNote = useNoteStore((s) => s.currentNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const toggleArchive = useNoteStore((s) => s.toggleArchive);
  const moveToTrash = useNoteStore((s) => s.moveToTrash);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const showToast = useUIStore((s) => s.showToast);

  const [title, setTitle] = React.useState(currentNote?.title || "Untitled");

  React.useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title || "Untitled");
    }
  }, [currentNote?.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (currentNote) {
      updateNote(currentNote.id, { title: newTitle });
    }
  };

  const handleBack = () => {
    setCurrentNoteId(null);
  };

  if (!currentNote) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No note selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={handleTitleChange}
              aria-label="Note title"
              className="w-full bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
              placeholder="Untitled"
            />
          </div>

          <div className="flex items-center gap-1">
            <Tooltip content={currentNote.isFavorite ? "Unfavorite" : "Favorite"}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => toggleFavorite(currentNote.id)}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    currentNote.isFavorite ? "text-yellow-500 fill-yellow-500" : ""
                  )}
                />
              </Button>
            </Tooltip>

            <Tooltip content="Share">
              <Button variant="ghost" size="icon-sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast("Link copied to clipboard", "success");
              }}>
                <Share2 className="h-4 w-4" />
              </Button>
            </Tooltip>

            <DropdownMenu
              trigger={
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            >
              <DropdownMenuItem
                icon={<Link2 className="h-4 w-4" />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied to clipboard", "success");
                }}
              >
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Copy className="h-4 w-4" />} onClick={() => {
                const now = new Date().toISOString();
                const duplicate = {
                  ...currentNote,
                  id: generateId(),
                  title: `${currentNote.title} (Copy)`,
                  content: currentNote.content,
                  plainText: currentNote.plainText,
                  createdAt: now,
                  updatedAt: now,
                };
                useNoteStore.getState().addNote(duplicate);
                showToast("Note duplicated", "success");
              }}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Archive className="h-4 w-4" />} onClick={() => {
                toggleArchive(currentNote.id);
                setCurrentNoteId(null);
                showToast(currentNote.isArchived ? "Note unarchived" : "Note archived", "success");
              }}>
                {currentNote.isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                icon={<Trash2 className="h-4 w-4" />}
                danger
                onClick={() => {
                  moveToTrash(currentNote.id);
                  setCurrentNoteId(null);
                }}
              >
                Move to Trash
              </DropdownMenuItem>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Tooltip content={rightPanelOpen ? "Close Properties" : "Open Properties"}>
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
          </div>
        </div>

        {/* Editor */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-8 py-6">
            <NoteEditor
              key={currentNote.id}
              noteId={currentNote.id}
              initialContent={currentNote.content}
              placeholder="Start writing, or press '/' for commands..."
            />
          </div>
        </ScrollArea>
      </div>

      {/* Properties Panel */}
      {rightPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full border-l border-border bg-background/50 overflow-hidden"
        >
          <div className="w-[280px] p-4 space-y-4">
            <h3 className="text-sm font-semibold">Properties</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Created</label>
                <p className="text-sm">{formatDateTime(currentNote.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Modified</label>
                <p className="text-sm">{formatDateTime(currentNote.updatedAt)}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Words</label>
                <p className="text-sm">{(currentNote.plainText?.split(/\s+/).length || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Reading Time</label>
                <p className="text-sm">{calculateReadingTime(currentNote.plainText || "")} min</p>
              </div>

              <Separator />

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentNote.tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No tags</span>
                  ) : (
                    currentNote.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Links</label>
                <p className="text-sm">
                  {currentNote.links.length} outgoing · {currentNote.backlinks.length} incoming
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
