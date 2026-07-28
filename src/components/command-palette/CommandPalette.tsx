"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Plus,
  Settings,
  Moon,
  Sun,
  LayoutDashboard,
  GitFork,
  CheckSquare,
  Calendar,
  PenTool,
  Database,
  FileCode,
  Sparkles,
  Clock,
  Star,
  Trash2,
  FolderOpen,
  Hash,
  Command,
  ArrowRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore, useNoteStore, useWorkspaceStore, useUIStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const setSettings = useAppStore((s) => s.setSettings);
  const settings = useAppStore((s) => s.settings);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const notes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const showToast = useUIStore((s) => s.showToast);

  const commands: Command[] = React.useMemo(() => {
    const noteCommands: Command[] = notes
      .filter((n) => !n.isDeleted)
      .slice(0, 20)
      .map((note) => ({
        id: `note-${note.id}`,
        label: note.title || "Untitled",
        description: note.plainText?.slice(0, 60),
        icon: <FileText className="h-4 w-4" />,
        category: "Notes",
        action: () => {
          setCurrentNoteId(note.id);
          setCurrentNote(note);
          onOpenChange(false);
        },
      }));

    return [
      {
        id: "new-note",
        label: "New Note",
        description: "Create a new note",
        icon: <Plus className="h-4 w-4" />,
        category: "Actions",
        shortcut: "Ctrl+N",
        action: () => {
          const now = new Date().toISOString();
          const note = {
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
          onOpenChange(false);
        },
      },
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Go to dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("dashboard"); onOpenChange(false); },
      },
      {
        id: "all-notes",
        label: "All Notes",
        description: "View all notes",
        icon: <FileText className="h-4 w-4" />,
        category: "Navigation",
        shortcut: "Ctrl+1",
        action: () => { setActiveView("notes"); onOpenChange(false); },
      },
      {
        id: "favorites",
        label: "Favorites",
        description: "View favorite notes",
        icon: <Star className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("favorites"); onOpenChange(false); },
      },
      {
        id: "recent",
        label: "Recent Notes",
        description: "View recent notes",
        icon: <Clock className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("recent"); onOpenChange(false); },
      },
      {
        id: "graph",
        label: "Graph View",
        description: "View knowledge graph",
        icon: <GitFork className="h-4 w-4" />,
        category: "Navigation",
        shortcut: "Ctrl+G",
        action: () => { setActiveView("graph"); onOpenChange(false); },
      },
      {
        id: "tasks",
        label: "Tasks",
        description: "View tasks",
        icon: <CheckSquare className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("tasks"); onOpenChange(false); },
      },
      {
        id: "calendar",
        label: "Calendar",
        description: "View calendar",
        icon: <Calendar className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("calendar"); onOpenChange(false); },
      },
      {
        id: "canvas",
        label: "Canvas",
        description: "Open infinite canvas",
        icon: <PenTool className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("canvas"); onOpenChange(false); },
      },
      {
        id: "database",
        label: "Database",
        description: "View database",
        icon: <Database className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("database"); onOpenChange(false); },
      },
      {
        id: "templates",
        label: "Templates",
        description: "Browse templates",
        icon: <FileCode className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("templates"); onOpenChange(false); },
      },
      {
        id: "ai-assistant",
        label: "AI Assistant",
        description: "Open AI assistant",
        icon: <Sparkles className="h-4 w-4" />,
        category: "Navigation",
        shortcut: "Ctrl+Shift+A",
        action: () => { setActiveView("ai"); onOpenChange(false); },
      },
      {
        id: "trash",
        label: "Trash",
        description: "View deleted notes",
        icon: <Trash2 className="h-4 w-4" />,
        category: "Navigation",
        action: () => { setActiveView("trash"); onOpenChange(false); },
      },
      {
        id: "settings",
        label: "Settings",
        description: "Open settings",
        icon: <Settings className="h-4 w-4" />,
        category: "Navigation",
        shortcut: "Ctrl+,",
        action: () => { setActiveView("settings"); onOpenChange(false); },
      },
      {
        id: "toggle-theme",
        label: `Switch to ${settings.theme === "dark" ? "Light" : "Dark"} Mode`,
        description: "Toggle color theme",
        icon: settings.theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
        category: "Appearance",
        action: () => {
          setSettings({ theme: settings.theme === "dark" ? "light" : "dark" });
          onOpenChange(false);
        },
      },
      {
        id: "toggle-sidebar",
        label: "Toggle Sidebar",
        description: "Show or hide sidebar",
        icon: <FolderOpen className="h-4 w-4" />,
        category: "Appearance",
        shortcut: "Ctrl+\\",
        action: () => {
          const store = useAppStore.getState();
          store.setSidebarCollapsed(!store.sidebarCollapsed);
          onOpenChange(false);
        },
      },
      ...noteCommands,
    ];
  }, [notes, settings, currentWorkspace, onOpenChange, setSettings, setActiveView, setCurrentNoteId, setCurrentNote, addNote]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower) ||
        cmd.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  const grouped = React.useMemo(() => {
    const groups: Record<string, Command[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[selectedIndex]?.action();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-xl rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <ScrollArea className="max-h-[350px]" ref={listRef}>
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <div className="p-1">
                    {Object.entries(grouped).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {category}
                        </div>
                        {items.map((cmd) => {
                          const globalIndex = filtered.indexOf(cmd);
                          return (
                            <button
                              key={cmd.id}
                              data-index={globalIndex}
                              onClick={cmd.action}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={cn(
                                "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                globalIndex === selectedIndex
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground hover:bg-accent/50"
                              )}
                            >
                              <span className="shrink-0 text-muted-foreground">
                                {cmd.icon}
                              </span>
                              <div className="flex-1 text-left">
                                <div className="font-medium">{cmd.label}</div>
                                {cmd.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {cmd.description}
                                  </div>
                                )}
                              </div>
                              {cmd.shortcut && (
                                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                  {cmd.shortcut}
                                </kbd>
                              )}
                              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">esc</kbd>
                  Close
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
