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
  PanelRightOpen,
  PanelRightClose,
  ArrowRight,
  FileText,
  CornerDownLeft,
  Link,
  Plus,
  ChevronRight,
  PenLine,
  Columns2,
  Eye,
  History,
  RotateCcw,
  ClipboardCopy,
  FileDown,
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
import { useHistoryStore, type NoteSnapshot } from "@/stores/useHistoryStore";
import { cn, formatDate, formatDateTime, calculateReadingTime, generateId } from "@/lib/utils";
import { htmlToMarkdown } from "@/lib/markdown";
import type { Note } from "@/types";

type PanelTab = "outline" | "properties" | "backlinks" | "outgoing" | "history";
type EditorMode = "edit" | "split" | "preview";

const viewModes: { id: EditorMode; label: string; icon: React.ReactNode }[] = [
  { id: "edit", label: "Edit", icon: <PenLine className="h-3 w-3" /> },
  { id: "split", label: "Split", icon: <Columns2 className="h-3 w-3" /> },
  { id: "preview", label: "Preview", icon: <Eye className="h-3 w-3" /> },
];

const panelTabs: { id: PanelTab; label: string }[] = [
  { id: "outline", label: "Outline" },
  { id: "properties", label: "Properties" },
  { id: "backlinks", label: "Backlinks" },
  { id: "outgoing", label: "Outgoing" },
  { id: "history", label: "History" },
];

export function NoteEditorView() {
  const currentNote = useNoteStore((s) => s.currentNote);
  const notes = useNoteStore((s) => s.notes);
  const updateNote = useNoteStore((s) => s.updateNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const toggleArchive = useNoteStore((s) => s.toggleArchive);
  const moveToTrash = useNoteStore((s) => s.moveToTrash);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const setRightPanelOpen = useUIStore((s) => s.setRightPanelOpen);
  const rightPanelTab = useUIStore((s) => s.rightPanelTab);
  const setRightPanelTab = useUIStore((s) => s.setRightPanelTab);
  const showToast = useUIStore((s) => s.showToast);
  const settings = useAppStore((s) => s.settings);
  const snapshots = useHistoryStore((s) => s.snapshots[currentNote?.id || ""] || []);

  const [title, setTitle] = React.useState(currentNote?.title || "Untitled");
  const [tagInput, setTagInput] = React.useState("");
  const [linkQuery, setLinkQuery] = React.useState("");
  const [mode, setMode] = React.useState<EditorMode>(settings.defaultView);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // Keep title + view mode in sync when switching notes (render-phase adjustment).
  const prevNoteIdRef = React.useRef(currentNote?.id);
  if (prevNoteIdRef.current !== currentNote?.id) {
    prevNoteIdRef.current = currentNote?.id;
    if (currentNote) {
      setTitle(currentNote.title || "Untitled");
      setMode(settings.defaultView);
    }
  }

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

  const downloadNoteMarkdown = () => {
    const md = htmlToMarkdown(currentNote?.content || "");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(currentNote?.title || "Untitled").replace(/[\\/:*?"<>|]/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Outline: headings extracted from the note's HTML, in document order.
  const outline = currentNote?.content
    ? Array.from(
        new DOMParser()
          .parseFromString(currentNote.content, "text/html")
          .querySelectorAll("h1,h2,h3,h4,h5,h6")
      ).map((h) => ({
        level: Number(h.tagName[1]),
        text: (h.textContent || "").trim() || "Untitled",
      }))
    : [];

  const filterByTag = (tagName: string) => {
    useNoteStore.getState().setFilterTag(tagName);
    useAppStore.getState().setActiveView("notes");
  };

  if (!currentNote) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No note selected</p>
      </div>
    );
  }

  // Incoming links: notes that reference this one via [[wiki-link]].
  const backlinks = notes.filter(
    (n) =>
      n.id !== currentNote.id &&
      !n.isDeleted &&
      n.links.some((l) => l.targetNoteId === currentNote.id)
  );

  // Outgoing links split into resolved / unresolved targets.
  const outgoingResolved = currentNote.links.filter(
    (l) => !l.targetNoteId.startsWith("unresolved:")
  );
  const outgoingUnresolved = currentNote.links.filter((l) =>
    l.targetNoteId.startsWith("unresolved:")
  );

  const openNote = (note: Note) => {
    useNoteStore.getState().setCurrentNote(note);
    useAppStore.getState().setCurrentNoteId(note.id);
    useAppStore.getState().openTab(note.id);
  };

  const addTag = () => {
    const tagName = tagInput.trim().toLowerCase();
    if (!tagName) return;
    if (!currentNote.tags.some((t) => t.name === tagName)) {
      const newTag = {
        id: generateId(),
        name: tagName,
        parentId: null,
        workspaceId: currentNote.workspaceId,
        createdAt: new Date().toISOString(),
      };
      updateNote(currentNote.id, { tags: [...currentNote.tags, newTag] });
    }
    setTagInput("");
  };

  const appendWikiLink = (note: Note) => {
    const wiki = `[[${note.title}]]`;
    const sep = currentNote.content.trim() ? "<p></p>" : "";
    const newContent = currentNote.content + sep + `<p>${wiki}</p>`;
    const newPlain = (currentNote.plainText ? currentNote.plainText.trimEnd() + "\n" : "") + wiki;
    const store = useNoteStore.getState();
    store.updateNote(currentNote.id, { content: newContent, plainText: newPlain });
    store.syncLinks(currentNote.id);
    setLinkQuery("");
    showToast(`Linked to \"${note.title}\"`, "success");
  };

  const linkCandidates = notes
    .filter(
      (n) =>
        !n.isDeleted &&
        n.id !== currentNote.id &&
        (linkQuery
          ? n.title.toLowerCase().includes(linkQuery.toLowerCase()) ||
            n.plainText?.toLowerCase().includes(linkQuery.toLowerCase())
          : true)
    )
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-11 items-center gap-1.5 border-b border-border px-3 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Back to notes">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={handleTitleChange}
              aria-label="Note title"
              className="w-full bg-transparent text-[15px] font-semibold outline-none placeholder:text-muted-foreground"
              placeholder="Untitled"
            />
          </div>

          <div className="flex items-center gap-0.5">
            {/* View mode toggle */}
            <div className="mr-1 flex shrink-0 items-center rounded-md border border-border bg-muted/40 p-0.5">
              {viewModes.map((m) => (
                <Tooltip key={m.id} content={`${m.label} mode`}>
                  <button
                    onClick={() => setMode(m.id)}
                    aria-label={`${m.label} mode`}
                    aria-pressed={mode === m.id}
                    className={cn(
                      "flex h-6 items-center gap-1 rounded px-1.5 text-[11px] font-medium transition-colors",
                      mode === m.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {m.icon}
                    <span className="hidden lg:inline">{m.label}</span>
                  </button>
                </Tooltip>
              ))}
            </div>

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

            <Tooltip content="Copy link to note">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast("Link copied to clipboard", "success");
                }}
              >
                <Link2 className="h-4 w-4" />
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
              <DropdownMenuItem
                icon={<ClipboardCopy className="h-4 w-4" />}
                onClick={() => {
                  navigator.clipboard.writeText(htmlToMarkdown(currentNote.content || ""));
                  showToast("Copied as Markdown", "success");
                }}
              >
                Copy as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem icon={<FileDown className="h-4 w-4" />} onClick={downloadNoteMarkdown}>
                Download .md
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                icon={<Copy className="h-4 w-4" />}
                onClick={() => {
                  const now = new Date().toISOString();
                  const duplicate: Note = {
                    ...currentNote,
                    id: generateId(),
                    title: `${currentNote.title} (Copy)`,
                    createdAt: now,
                    updatedAt: now,
                    links: [],
                    backlinks: [],
                  };
                  useNoteStore.getState().addNote(duplicate);
                  showToast("Note duplicated", "success");
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={<Archive className="h-4 w-4" />}
                onClick={() => {
                  toggleArchive(currentNote.id);
                  setCurrentNoteId(null);
                  showToast(currentNote.isArchived ? "Note unarchived" : "Note archived", "success");
                }}
              >
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

            <Tooltip content={rightPanelOpen ? "Close Panel" : "Open Panel"}>
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

        {/* Content: Edit / Split / Preview */}
        {mode === "preview" ? (
          <ScrollArea className="flex-1">
            <div ref={contentRef} className="max-w-3xl mx-auto px-8 py-6">
              <NotePreview note={currentNote} onOpenNote={openNote} />
            </div>
          </ScrollArea>
        ) : mode === "split" ? (
          <div className="flex flex-1 overflow-hidden">
            <ScrollArea className="flex-1 md:border-r md:border-border">
              <div ref={contentRef} className="max-w-3xl mx-auto px-8 py-6">
                <NoteEditor
                  key={currentNote.id}
                  noteId={currentNote.id}
                  initialContent={currentNote.content}
                  placeholder="Start writing — use [[ to link another note..."
                />
              </div>
            </ScrollArea>
            <ScrollArea className="hidden md:flex flex-1">
              <div className="max-w-3xl mx-auto px-8 py-6">
                <NotePreview note={currentNote} onOpenNote={openNote} />
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div ref={contentRef} className="max-w-3xl mx-auto px-8 py-6">
              <NoteEditor
                key={currentNote.id}
                noteId={currentNote.id}
                initialContent={currentNote.content}
                placeholder="Start writing — use [[ to link another note..."
              />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Right Panel */}
      {rightPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 288, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="h-full border-l border-border bg-background overflow-hidden shrink-0"
        >
          <div className="w-[288px] h-full flex flex-col bg-background">
            {/* Tabs */}
            <div className="flex items-center border-b border-border px-2 pt-1.5 gap-1 shrink-0">
              {panelTabs.map((tab) => {
                const count =
                  tab.id === "outline"
                    ? outline.length
                    : tab.id === "backlinks"
                      ? backlinks.length
                      : tab.id === "outgoing"
                        ? currentNote.links.length
                        : tab.id === "history"
                          ? snapshots.length
                          : undefined;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setRightPanelTab(tab.id)}
                    className={cn(
                      "relative px-3 py-2 text-xs font-medium transition-colors",
                      rightPanelTab === tab.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                    {count !== undefined && count > 0 && (
                      <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
                        {count}
                      </span>
                    )}
                    {rightPanelTab === tab.id && (
                      <motion.span
                        layoutId="panel-tab-indicator"
                        className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="flex-1 p-4">
              {rightPanelTab === "outline" && (
                <OutlineTab contentRef={contentRef} />
              )}

              {rightPanelTab === "properties" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 block">
                      Created
                    </label>
                    <p className="text-sm">{formatDateTime(currentNote.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 block">
                      Modified
                    </label>
                    <p className="text-sm">{formatDateTime(currentNote.updatedAt)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 block">
                        Words
                      </label>
                      <p className="text-sm">{(currentNote.plainText?.split(/\s+/).filter(Boolean).length || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 block">
                        Reading
                      </label>
                      <p className="text-sm">{calculateReadingTime(currentNote.plainText || "")} min</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1 block">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {currentNote.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No tags yet</span>
                      ) : (
                        currentNote.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs gap-1 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                            onClick={() => filterByTag(tag.name)}
                          >
                            <Tag className="h-3 w-3" />
                            {tag.name}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTags = currentNote.tags.filter((t) => t.id !== tag.id);
                                updateNote(currentNote.id, { tags: newTags });
                              }}
                              className="ml-0.5 hover:text-destructive"
                              aria-label={`Remove tag ${tag.name}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add tag..."
                        className="h-8 text-xs"
                      />
                      <Button variant="outline" size="icon-sm" onClick={addTag} aria-label="Add tag">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === "backlinks" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Notes that link to this one via <code className="font-mono text-[11px]">[[{currentNote.title}]]</code>.
                  </p>
                  {backlinks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center">
                      <FileText className="h-5 w-5 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No backlinks yet. Reference this note from another note using{" "}
                        <code className="font-mono">[[{currentNote.title}]]</code>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {backlinks.map((note) => (
                        <button
                          key={note.id}
                          onClick={() => openNote(note)}
                          className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-card/40 px-3 py-2.5 text-left hover:bg-accent/60 transition-colors"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {note.plainText?.slice(0, 80) || "Empty note"}
                            </p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {rightPanelTab === "history" && (
                <HistoryTab noteId={currentNote.id} snapshots={snapshots} />
              )}

              {rightPanelTab === "outgoing" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Wiki-links in this note. Type <code className="font-mono text-[11px]">[[Note Title]]</code> anywhere in the editor to create one.
                  </p>

                  {outgoingResolved.length === 0 && outgoingUnresolved.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center">
                      <Link className="h-5 w-5 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No outgoing links yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {outgoingResolved.map((link) => {
                        const target = notes.find((n) => n.id === link.targetNoteId);
                        if (!target) return null;
                        return (
                          <button
                            key={link.id}
                            onClick={() => openNote(target)}
                            className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-card/40 px-3 py-2 text-left hover:bg-accent/60 transition-colors"
                          >
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="text-sm flex-1 truncate">{target.title || "Untitled"}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        );
                      })}
                      {outgoingUnresolved.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-2.5 rounded-lg border border-dashed border-border bg-card/20 px-3 py-2"
                        >
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-sm flex-1 truncate">{link.label}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">no note yet</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 block">
                      Link to note
                    </label>
                    <Input
                      icon={<Link className="h-3.5 w-3.5" />}
                      value={linkQuery}
                      onChange={(e) => setLinkQuery(e.target.value)}
                      placeholder="Search notes to link..."
                      className="h-8 text-xs"
                    />
                    {linkQuery && linkCandidates.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {linkCandidates.map((note) => (
                          <button
                            key={note.id}
                            onClick={() => appendWikiLink(note)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/60 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">{note.title || "Untitled"}</span>
                            <CornerDownLeft className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                {formatDate(currentNote.updatedAt)}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Outline (table of contents): lists the note's headings and scrolls the
 * editor/preview to the selected one when clicked.
 */
function OutlineTab({ contentRef }: { contentRef: React.RefObject<HTMLDivElement | null> }) {
  const currentNote = useNoteStore((s) => s.currentNote);

  if (!currentNote) return null;
  const doc = new DOMParser().parseFromString(currentNote.content, "text/html");
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));

  if (headings.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          An outline of your note&apos;s headings will appear here.
        </p>
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">No headings yet. Use H1–H6 in the toolbar.</p>
        </div>
      </div>
    );
  }

  const scrollToHeading = (index: number) => {
    const container = contentRef.current;
    if (!container) return;
    const els = container.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const target = els[index];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-0.5">
      {headings.map((h, i) => {
        const level = Number(h.tagName[1]);
        return (
          <button
            key={`${i}-${h.textContent}`}
            onClick={() => scrollToHeading(i)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
            style={{ paddingLeft: `${8 + (level - 1) * 12}px` }}
          >
            <span
              className="shrink-0 rounded-sm bg-muted-foreground/30"
              style={{ width: `${Math.max(8, 16 - (level - 1) * 2)}px`, height: 2 }}
            />
            <span className="truncate">{h.textContent?.trim() || "Untitled"}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Version history for a note: auto-snapshots with restore.
 */
function HistoryTab({
  noteId,
  snapshots,
}: {
  noteId: string;
  snapshots: NoteSnapshot[];
}) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const showToast = useUIStore((s) => s.showToast);
  const restoreSnapshot = useHistoryStore((s) => s.restoreSnapshot);
  const clearNoteHistory = useHistoryStore((s) => s.clearNoteHistory);

  // Newest first.
  const list = [...snapshots].reverse();

  if (list.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Every time you edit, a snapshot is saved here automatically — like a safety net for your writing.
        </p>
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <History className="h-5 w-5 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground">
            No versions yet. Start writing and versions will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {list.length} {list.length === 1 ? "version" : "versions"} saved
        </p>
        <button
          onClick={() => {
            clearNoteHistory(noteId);
            setExpandedId(null);
            showToast("History cleared", "info");
          }}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>

      {list.map((snap) => {
        const expanded = expandedId === snap.id;
        return (
          <div
            key={snap.id}
            className="overflow-hidden rounded-lg border border-border bg-card/40"
          >
            <button
              onClick={() => setExpandedId(expanded ? null : snap.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors"
            >
              <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{formatDateTime(snap.createdAt)}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {snap.plainText?.slice(0, 60) || "(empty version)"}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                {snap.wordCount} words
              </span>
            </button>

            {expanded && (
              <div className="border-t border-border px-3 py-3 space-y-3">
                <div className="note-editor markdown-preview max-h-48 overflow-y-auto rounded-md border border-border bg-background/40 px-3 py-2">
                  <div
                    className="ProseMirror !min-h-0 text-xs"
                    style={{ fontSize: 12.5, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: snap.content || "<p><br></p>" }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      restoreSnapshot(noteId, snap.id);
                      setExpandedId(null);
                      showToast("Version restored", "success");
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore this version
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Read-only rendering of a note's stored HTML, reusing the editor's
 * typography. Wiki-link pills are clickable and jump straight to the note.
 */
function NotePreview({ note, onOpenNote }: { note: Note; onOpenNote: (note: Note) => void }) {
  const settings = useAppStore((s) => s.settings);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("span[data-wikilink]");
    if (el) {
      const title = el.getAttribute("data-wikilink") || "";
      const target = useNoteStore
        .getState()
        .notes.find((n) => !n.isDeleted && n.title.toLowerCase() === title.toLowerCase());
      if (target) onOpenNote(target);
      return;
    }
    // Clicking an inline #tag filters the vault to that tag.
    const tagEl = (e.target as HTMLElement).closest<HTMLElement>("span[data-tag]");
    if (tagEl) {
      const tagName = tagEl.getAttribute("data-tag") || "";
      if (tagName) {
        useNoteStore.getState().setFilterTag(tagName);
        useAppStore.getState().setActiveView("notes");
      }
    }
  };

  if (!note.content.trim()) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">This note is empty.</p>
      </div>
    );
  }

  return (
    <div className="note-editor markdown-preview">
      <div
        className="ProseMirror"
        style={{ fontSize: settings.fontSize || 16, lineHeight: settings.lineHeight || 1.75 }}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </div>
  );
}
