"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import "@/styles/editor.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Highlight } from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { EditorToolbar } from "./EditorToolbar";
import { WikiLink } from "./extensions/WikiLink";
import { WikiLinkPreview } from "./WikiLinkPreview";
import { useNoteStore, useAppStore } from "@/stores";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { useAutoSave } from "@/hooks";
import { cn, convertWikiLinksToHtml, generateId } from "@/lib/utils";
import type { Note } from "@/types";

interface NoteEditorProps {
  noteId?: string;
  initialContent?: string;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
}

interface WikiPreview {
  title: string;
  note: Note | null;
  x: number;
  y: number;
}

export function NoteEditor({
  noteId,
  initialContent = "",
  placeholder = "Start writing...",
  className,
  readonly = false,
}: NoteEditorProps) {
  const updateNote = useNoteStore((s) => s.updateNote);
  const notes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const reloadToken = useNoteStore((s) => s.editorReloadToken);
  const settings = useAppStore((s) => s.settings);
  const [content, setContent] = React.useState(initialContent);
  const [preview, setPreview] = React.useState<WikiPreview | null>(null);
  const prevNoteIdRef = React.useRef<string | undefined>(noteId);
  const lastReloadTokenRef = React.useRef(reloadToken);

  // Migrate raw [[wiki-links]] in stored HTML into interactive spans.
  const contentToLoad = React.useMemo(
    () => convertWikiLinksToHtml(initialContent),
    [initialContent]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Placeholder.configure({ placeholder }),
      WikiLink,
      TaskList,
      TaskItem.configure({ nested: true }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "editor-link" },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "editor-image" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight.configure({ multicolor: true }),
      Typography,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
    ],
    content: contentToLoad,
    editable: !readonly,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      const text = e.getText();
      setContent(html);
      if (noteId) {
        const store = useNoteStore.getState();
        store.updateNote(noteId, { content: html, plainText: text });
        store.syncLinks(noteId);
        // Auto version snapshots (throttled inside the store).
        useHistoryStore.getState().addSnapshot(noteId, html, text);
      }
    },
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
  });

  useAutoSave({
    data: content,
    onSave: (data) => {
      if (noteId) {
        updateNote(noteId, { content: data as string });
      }
    },
    delay: settings.autoSaveDelay || 1000,
    enabled: settings.autoSave && !!noteId,
  });

  React.useEffect(() => {
    if (!editor) return;
    const noteChanged = prevNoteIdRef.current !== noteId;
    const reloadRequested = lastReloadTokenRef.current !== reloadToken;
    if (noteChanged || reloadRequested) {
      prevNoteIdRef.current = noteId;
      lastReloadTokenRef.current = reloadToken;
      const contentToSet = contentToLoad;
      if (editor.getHTML() !== contentToSet) {
        editor.commands.setContent(contentToSet, { emitUpdate: false });
      }
    }
  }, [noteId, contentToLoad, reloadToken, editor]);

  // Close the preview on outside clicks / Escape.
  React.useEffect(() => {
    if (!preview) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("span[data-wikilink]")) return;
      setPreview(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [preview]);

  const handleEditorMouseDown = (e: React.MouseEvent) => {
    // Don't move the caret into wiki-link atoms.
    if ((e.target as HTMLElement).closest("span[data-wikilink]")) {
      e.preventDefault();
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("span[data-wikilink]");
    if (!el) {
      setPreview(null);
      return;
    }
    const title = el.getAttribute("data-wikilink") || "";
    const note =
      notes.find(
        (n) => !n.isDeleted && n.title.toLowerCase() === title.toLowerCase()
      ) || null;
    const rect = el.getBoundingClientRect();
    setPreview({ title, note, x: rect.left, y: rect.bottom + 8 });
  };

  const handleOpenNote = (note: Note) => {
    setPreview(null);
    useNoteStore.getState().setCurrentNote(note);
    useAppStore.getState().setCurrentNoteId(note.id);
    useAppStore.getState().openTab(note.id);
  };

  const handleCreateNote = () => {
    if (!preview) return;
    const now = new Date().toISOString();
    const note: Note = {
      id: generateId(),
      title: preview.title,
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
    // Re-resolve this note's [[links]] now that the target exists.
    if (noteId) useNoteStore.getState().syncLinks(noteId);
    handleOpenNote(note);
  };

  // Respect the user's font size / line-height preferences.
  const fontSize = settings.fontSize || 16;
  const lineHeight = settings.lineHeight || 1.75;

  if (!editor) return null;

  return (
    <div className={cn("note-editor", className)}>
      {!readonly && (
        <div className="mb-3 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
          <EditorToolbar editor={editor} />
        </div>
      )}

      {/* Apply font size / line-height here so the toolbar stays at its own size */}
      <div
        style={{ fontSize, lineHeight }}
        onMouseDown={handleEditorMouseDown}
        onClick={handleEditorClick}
      >
        <EditorContent editor={editor} />
      </div>

      <AnimatePresence>
        {preview && (
          <WikiLinkPreview
            key={`${preview.title}-${preview.note?.id ?? "new"}`}
            title={preview.title}
            note={preview.note}
            x={preview.x}
            y={preview.y}
            onOpen={handleOpenNote}
            onCreate={handleCreateNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
