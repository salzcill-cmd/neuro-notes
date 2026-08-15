"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Star,
  Clock,
  FolderOpen,
  Folder,
  ChevronRight,
  Plus,
  Hash,
  Calendar,
  CheckSquare,
  LayoutDashboard,
  GitFork,
  PenTool,
  Database,
  Trash2,
  Settings,
  FileCode,
  PanelLeftClose,
  StickyNote,
  Archive,
  PenLine,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore, useNoteStore, useWorkspaceStore, useTagStore, useTaskStore, useUIStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";
import type { Note, Folder as FolderType } from "@/types";

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SidebarSection({ title, children, defaultOpen = true }: SidebarSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
        {title}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 space-y-px">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
  badge?: React.ReactNode;
}

function SidebarItem({ icon, label, count, active, onClick, onContextMenu, className, badge }: SidebarItemProps) {
  return (
    <button
      onClick={() => {
        onClick?.();
      }}
      onContextMenu={onContextMenu}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-150",
        "hover:bg-accent/50",
        active && "bg-accent text-accent-foreground font-medium",
        !active && "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      {badge}
      {count !== undefined && (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

function FolderItem({
  folder,
  level = 0,
  onNavigate,
  onRequestDelete,
  onRequestNewSubfolder,
}: {
  folder: FolderType;
  level?: number;
  onNavigate?: () => void;
  onRequestDelete?: (folder: FolderType) => void;
  onRequestNewSubfolder?: (folder: FolderType) => void;
}) {
  const expandedFolders = useAppStore((s) => s.expandedFolders);
  const toggleFolder = useAppStore((s) => s.toggleFolder);
  const currentFolderId = useAppStore((s) => s.currentFolderId);
  const setCurrentFolderId = useAppStore((s) => s.setCurrentFolderId);
  const updateFolder = useWorkspaceStore((s) => s.updateFolder);
  const setContextMenu = useUIStore((s) => s.setContextMenu);
  const notes = useNoteStore((s) => s.notes);
  const folders = useWorkspaceStore((s) => s.folders);
  const expanded = expandedFolders.has(folder.id);
  const isActive = currentFolderId === folder.id;

  const [renaming, setRenaming] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState(folder.name);
  const renameInputRef = React.useRef<HTMLInputElement>(null);

  const subFolders = folders.filter((f) => f.parentId === folder.id);
  const noteCount = notes.filter((n) => n.folderId === folder.id && !n.isDeleted).length;

  React.useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renaming]);

  const commitRename = () => {
    const name = renameValue.trim();
    if (name && name !== folder.name) {
      updateFolder(folder.id, { name });
    } else {
      setRenameValue(folder.name);
    }
    setRenaming(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: "Rename",
          icon: <PenLine className="h-3.5 w-3.5" />,
          action: () => {
            setRenameValue(folder.name);
            setRenaming(true);
          },
        },
        {
          label: "New Subfolder",
          icon: <FolderPlus className="h-3.5 w-3.5" />,
          action: () => onRequestNewSubfolder?.(folder),
        },
        { separator: true },
        {
          label: "Delete Folder",
          icon: <Trash2 className="h-3.5 w-3.5" />,
          danger: true,
          action: () => onRequestDelete?.(folder),
        },
      ],
    });
  };

  return (
    <div>
      <button
        onClick={() => {
          if (renaming) return;
          toggleFolder(folder.id);
          setCurrentFolderId(folder.id);
          onNavigate?.();
        }}
        onContextMenu={handleContextMenu}
        className={cn(
          "group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-all",
          "hover:bg-accent/50",
          isActive && "bg-accent text-accent-foreground",
          !isActive && "text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${8 + level * 12}px` }}
      >
        {subFolders.length > 0 ? (
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
              expanded && "rotate-90"
            )}
          />
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {expanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        {renaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitRename();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setRenameValue(folder.name);
                setRenaming(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 rounded border border-primary bg-background px-1 py-0.5 text-[13px] text-foreground outline-none"
            aria-label={`Rename folder ${folder.name}`}
          />
        ) : (
          <span className="flex-1 truncate text-left">{folder.name}</span>
        )}
        {noteCount > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {noteCount}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && subFolders.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {subFolders.map((subFolder) => (
              <FolderItem
                key={subFolder.id}
                folder={subFolder}
                level={level + 1}
                onNavigate={onNavigate}
                onRequestDelete={onRequestDelete}
                onRequestNewSubfolder={onRequestNewSubfolder}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteItem({ note, onNavigate }: { note: Note; onNavigate?: () => void }) {
  const currentNoteId = useAppStore((s) => s.currentNoteId);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const openTab = useAppStore((s) => s.openTab);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const isActive = currentNoteId === note.id;

  const handleClick = () => {
    setCurrentNoteId(note.id);
    setCurrentNote(note);
    openTab(note.id);
    onNavigate?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all",
        "hover:bg-accent/50",
        isActive && "bg-accent text-accent-foreground font-medium",
        !isActive && "text-muted-foreground hover:text-foreground"
      )}
    >
      {note.color && note.color !== "transparent" ? (
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: note.color }}
        />
      ) : (
        <FileText className="h-4 w-4 shrink-0" />
      )}
      <span className="flex-1 truncate text-left">{note.title || "Untitled"}</span>
      {note.isPinned && (
        <span className="text-muted-foreground">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
          </svg>
        </span>
      )}
    </button>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const sidebarWidth = useAppStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);

  const notes = useNoteStore((s) => s.notes);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const addNote = useNoteStore((s) => s.addNote);
  const filterTag = useNoteStore((s) => s.filterTag);
  const setFilterTag = useNoteStore((s) => s.setFilterTag);

  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const folders = useWorkspaceStore((s) => s.folders);
  const addFolder = useWorkspaceStore((s) => s.addFolder);

  const tags = useTagStore((s) => s.tags);
  const tasks = useTaskStore((s) => s.tasks);
  const deleteFolder = useWorkspaceStore((s) => s.deleteFolder);
  const updateNote = useNoteStore((s) => s.updateNote);
  const showToast = useUIStore((s) => s.showToast);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<FolderType | null>(null);

  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);
  const recentNotes = [...activeNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const favoriteNotes = activeNotes.filter((n) => n.isFavorite);
  const rootFolders = folders.filter((f) => f.parentId === null);
  const pendingTasks = tasks.filter((t) => t.status !== "done" && !t.subtasks.length);
  const archivedNotes = notes.filter((n) => n.isArchived && !n.isDeleted);

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
    onNavigate?.();
  };

  const handleNewFolder = () => {
    addFolder({
      name: "New Folder",
      parentId: null,
      workspaceId: currentWorkspace?.id || "default",
    });
  };

  /** Collect a folder and all of its descendants (recursively). */
  const collectFolderTree = (id: string): string[] => {
    const ids = [id];
    for (const f of folders) {
      if (f.parentId === id) {
        ids.push(...collectFolderTree(f.id));
      }
    }
    return ids;
  };

  const handleNewSubfolder = (parent: FolderType) => {
    addFolder({
      name: "New Folder",
      parentId: parent.id,
      workspaceId: parent.workspaceId,
    });
    // Expand the parent so the new subfolder is visible.
    useAppStore.getState().toggleFolder(parent.id);
    showToast(`Subfolder created in "${parent.name}"`, "success");
  };

  const handleDeleteFolder = (target: FolderType) => {
    const ids = collectFolderTree(target.id);
    const idSet = new Set(ids);

    // Move notes living in the deleted folders back to the root level
    // (unfiled) instead of silently deleting user content.
    notes
      .filter((n) => n.folderId && idSet.has(n.folderId) && !n.isDeleted)
      .forEach((n) => updateNote(n.id, { folderId: null }));

    ids.forEach((id) => deleteFolder(id));

    if (useAppStore.getState().currentFolderId && idSet.has(useAppStore.getState().currentFolderId!)) {
      useAppStore.getState().setCurrentFolderId(null);
    }

    setDeleteTarget(null);
    showToast(`Folder "${target.name}" deleted`, "success");
  };

  const navigate = (view: string) => {
    setActiveView(view);
    onNavigate?.();
  };

  const filteredNotes = searchQuery
    ? activeNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.plainText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
    { id: "notes", icon: <FileText className="h-4 w-4" />, label: "All Notes", count: activeNotes.length },
    { id: "favorites", icon: <Star className="h-4 w-4" />, label: "Favorites", count: favoriteNotes.length },
    { id: "recent", icon: <Clock className="h-4 w-4" />, label: "Recent" },
    { id: "daily", icon: <StickyNote className="h-4 w-4" />, label: "Daily Notes" },
    { id: "tasks", icon: <CheckSquare className="h-4 w-4" />, label: "Tasks", count: pendingTasks.length },
    { id: "calendar", icon: <Calendar className="h-4 w-4" />, label: "Calendar" },
    { id: "graph", icon: <GitFork className="h-4 w-4" />, label: "Graph View" },
    { id: "canvas", icon: <PenTool className="h-4 w-4" />, label: "Canvas" },
    { id: "database", icon: <Database className="h-4 w-4" />, label: "Database" },
    { id: "templates", icon: <FileCode className="h-4 w-4" />, label: "Templates" },
    { id: "archive", icon: <Archive className="h-4 w-4" />, label: "Archive", count: archivedNotes.length > 0 ? archivedNotes.length : undefined },
  ];

  return (
    <aside
      className="flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground"
      style={{ width: sidebarCollapsed ? 48 : sidebarWidth }}
    >
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-3 shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              N
            </div>
            <span className="text-sm font-semibold">NeuroNotes</span>
          </div>
        )}
        <div className="flex items-center gap-0.5">
          {!sidebarCollapsed && (
            <Tooltip content="New Note" shortcut="Ctrl+N">
              <Button variant="ghost" size="icon-sm" onClick={handleNewNote}>
                <Plus className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
          <Tooltip content={sidebarCollapsed ? "Expand" : "Collapse"}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <PanelLeftClose
                className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
              />
            </Button>
          </Tooltip>
        </div>
      </div>

      {!sidebarCollapsed && (
        <>
          {/* Search */}
          <div className="px-2 py-2 shrink-0">
            <Input
              icon={<Search className="h-3.5 w-3.5" />}
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <ScrollArea className="flex-1 px-2">
            {/* Search Results */}
            {searchQuery && (
              <div className="mb-2">
                <SidebarSection title="Search Results" defaultOpen>
                  {filteredNotes.length === 0 ? (
                    <p className="px-2 py-2 text-xs text-muted-foreground">No notes found</p>
                  ) : (
                    filteredNotes.map((note) => (
                      <NoteItem key={note.id} note={note} onNavigate={onNavigate} />
                    ))
                  )}
                </SidebarSection>
              </div>
            )}

            {/* Navigation */}
            <SidebarSection title="Navigation" defaultOpen>
              {navItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  count={item.count}
                  active={activeView === item.id}
                  onClick={() => navigate(item.id)}
                />
              ))}
            </SidebarSection>

            <Separator className="my-2" />

            {/* Folders */}
            <SidebarSection
              title="Folders"
              defaultOpen
            >
              {rootFolders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  onNavigate={onNavigate}
                  onRequestDelete={setDeleteTarget}
                  onRequestNewSubfolder={handleNewSubfolder}
                />
              ))}
              <button
                onClick={handleNewFolder}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                New Folder
              </button>
            </SidebarSection>

            <Separator className="my-2" />

            {/* Recent Notes */}
            {recentNotes.length > 0 && (
              <SidebarSection title="Recent">
                {recentNotes.map((note) => (
                  <NoteItem key={note.id} note={note} onNavigate={onNavigate} />
                ))}
              </SidebarSection>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <>
                <Separator className="my-2" />
                <SidebarSection title="Tags">
                  {tags.slice(0, 10).map((tag) => (
                    <SidebarItem
                      key={tag.id}
                      icon={<Hash className="h-4 w-4" />}
                      label={tag.name}
                      onClick={() => {
                        setFilterTag(filterTag === tag.name ? null : tag.name);
                        if (filterTag !== tag.name) {
                          navigate("notes");
                        } else {
                          onNavigate?.();
                        }
                      }}
                      badge={
                        tag.color ? (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </SidebarSection>
              </>
            )}

            {/* Favorites */}
            {favoriteNotes.length > 0 && (
              <>
                <Separator className="my-2" />
                <SidebarSection title="Favorites">
                  {favoriteNotes.map((note) => (
                    <NoteItem key={note.id} note={note} onNavigate={onNavigate} />
                  ))}
                </SidebarSection>
              </>
            )}

            <div className="h-4" />
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-border p-2 shrink-0 space-y-px">
            <SidebarItem
              icon={<Trash2 className="h-4 w-4" />}
              label="Trash"
              count={notes.filter((n) => n.isDeleted).length}
              active={activeView === "trash"}
              onClick={() => navigate("trash")}
            />
            <SidebarItem
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              active={activeView === "settings"}
              onClick={() => navigate("settings")}
            />
          </div>
        </>
      )}

      {/* Collapsed Icons */}
      {sidebarCollapsed && (
        <div className="flex flex-col items-center gap-1 py-2 px-1">
          {navItems.slice(0, 8).map((item) => (
            <Tooltip key={item.id} content={item.label} side="right">
              <button
                onClick={() => navigate(item.id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                  activeView === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.icon}
              </button>
            </Tooltip>
          ))}
          <Separator className="w-6 my-1" />
          <Tooltip content="Settings" side="right">
            <button
              onClick={() => navigate("settings")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Delete folder confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              Delete Folder?
            </DialogTitle>
            <DialogDescription>
              Delete <span className="font-medium text-foreground">&quot;{deleteTarget?.name}&quot;</span> and
              all of its subfolders? Notes inside will be moved to the root level — nothing is lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTarget && handleDeleteFolder(deleteTarget)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
