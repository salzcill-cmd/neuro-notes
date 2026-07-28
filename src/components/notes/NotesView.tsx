"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  FileText,
  Star,
  Clock,
  Trash2,
  Archive,
  Tag,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNoteStore, useAppStore, useWorkspaceStore, useTagStore } from "@/stores";
import { cn, formatDate, generateId, calculateReadingTime } from "@/lib/utils";
import type { Note } from "@/types";

function NoteCard({ note, view }: { note: Note; view: "grid" | "list" }) {
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const moveToTrash = useNoteStore((s) => s.moveToTrash);
  const restoreFromTrash = useNoteStore((s) => s.restoreFromTrash);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const tags = useTagStore((s) => s.tags);
  const isTrash = note.isDeleted === true;

  const handleClick = () => {
    if (isTrash) return;
    setCurrentNote(note);
    setCurrentNoteId(note.id);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreFromTrash(note.id);
  };

  const handlePermanentDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNote(note.id);
  };

  if (view === "list") {
    return (
      <motion.button
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClick}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card/30 p-3 hover:bg-accent/30 hover:border-border/80 transition-all text-left group"
      >
        {note.color && note.color !== "transparent" ? (
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: note.color }}
          />
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
            {note.isPinned && (
              <svg className="h-3 w-3 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
              </svg>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {note.plainText?.slice(0, 120) || "Empty note"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground">{formatDate(note.updatedAt)}</span>
          {isTrash && (
            <div className="flex items-center gap-1 ml-2">
              <button onClick={handleRestore} className="text-xs text-primary hover:underline">Restore</button>
              <span className="text-muted-foreground">·</span>
              <button onClick={handlePermanentDelete} className="text-xs text-destructive hover:underline">Delete</button>
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card/30 p-4 hover:bg-accent/30 hover:border-border/80 transition-all text-left group cursor-pointer",
        note.color && note.color !== "transparent" && "border-l-2",
      )}
      style={note.color && note.color !== "transparent" ? { borderLeftColor: note.color } : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {note.icon ? (
            <span className="text-lg">{note.icon}</span>
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <h3 className="text-sm font-semibold truncate">{note.title || "Untitled"}</h3>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(note.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              toggleFavorite(note.id);
            }
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Star
            className={cn(
              "h-3.5 w-3.5",
              note.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
            )}
          />
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
        {note.plainText?.slice(0, 200) || "Empty note"}
      </p>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
        <div className="flex gap-1">
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-[10px]">
              {tag.name}
            </Badge>
          ))}
        </div>
        {isTrash ? (
          <div className="flex items-center gap-2">
            <button onClick={handleRestore} className="text-[10px] text-primary hover:underline">Restore</button>
            <button onClick={handlePermanentDelete} className="text-[10px] text-destructive hover:underline">Delete</button>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">{calculateReadingTime(note.plainText || "")} min read</span>
        )}
      </div>
    </motion.div>
  );
}

export function NotesView() {
  const activeView = useAppStore((s) => s.activeView);
  const notes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = React.useState<"desc" | "asc">("desc");

  const filteredNotes = React.useMemo(() => {
    let result = notes.filter((n) => {
      if (n.isDeleted && activeView !== "trash") return false;
      if (activeView === "trash" && !n.isDeleted) return false;
      if (activeView === "favorites" && !n.isFavorite) return false;
      if (n.isArchived && activeView !== "archive") return false;
      return true;
    });

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.plainText?.toLowerCase().includes(lower)
      );
    }

    result.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime();
      const bTime = new Date(b.updatedAt).getTime();
      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [notes, activeView, searchQuery, sortOrder]);

  const handleNewNote = () => {
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: "Untitled",
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
    setCurrentNote(note);
    setCurrentNoteId(note.id);
  };

  const viewTitle = {
    notes: "All Notes",
    favorites: "Favorites",
    recent: "Recent Notes",
    daily: "Daily Notes",
    trash: "Trash",
    archive: "Archive",
  }[activeView] || "Notes";

  return (
    <ScrollArea className="h-full">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{viewTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Button onClick={handleNewNote}>
            <Plus className="h-4 w-4 mr-1" />
            New Note
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            >
              {sortOrder === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Notes Grid/List */}
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No notes found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Create your first note to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={handleNewNote}>
                <Plus className="h-4 w-4 mr-1" />
                Create Note
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                : "flex flex-col gap-2"
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} view={viewMode} />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
