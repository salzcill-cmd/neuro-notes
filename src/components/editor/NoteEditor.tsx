"use client";

import * as React from "react";
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
import { useNoteStore, useAppStore } from "@/stores";
import { useAutoSave } from "@/hooks";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  noteId?: string;
  initialContent?: string;
  placeholder?: string;
  className?: string;
  readonly?: boolean;
}

export function NoteEditor({
  noteId,
  initialContent = "",
  placeholder = "Start writing...",
  className,
  readonly = false,
}: NoteEditorProps) {
  const updateNote = useNoteStore((s) => s.updateNote);
  const settings = useAppStore((s) => s.settings);
  const [content, setContent] = React.useState(initialContent);
  const prevNoteIdRef = React.useRef<string | undefined>(noteId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
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
    content: initialContent || "",
    editable: !readonly,
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      const text = e.getText();
      setContent(html);
      if (noteId) {
        updateNote(noteId, { content: html, plainText: text });
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
    if (prevNoteIdRef.current !== noteId) {
      prevNoteIdRef.current = noteId;
      const contentToSet = initialContent || "";
      if (editor.getHTML() !== contentToSet) {
        editor.commands.setContent(contentToSet, { emitUpdate: false });
      }
    }
  }, [noteId, initialContent, editor]);

  if (!editor) return null;

  return (
    <div className={cn("note-editor", className)}>
      {!readonly && (
        <div className="mb-3 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
          <EditorToolbar editor={editor} />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
