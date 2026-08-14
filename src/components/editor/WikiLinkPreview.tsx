"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import type { Note } from "@/types";

interface WikiLinkPreviewProps {
  title: string;
  note: Note | null;
  x: number;
  y: number;
  onOpen: (note: Note) => void;
  onCreate: () => void;
}

/**
 * Popover shown when a `[[wiki-link]]` is clicked in the editor.
 * Rendered in a portal at fixed viewport coordinates so it stays
 * above scroll containers, with clamping to keep it on screen.
 */
export function WikiLinkPreview({ title, note, x, y, onOpen, onCreate }: WikiLinkPreviewProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x, y });

  // Clamp to the viewport after the popover has its real size.
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let px = x;
    let py = y;
    if (px + r.width > vw - 8) px = Math.max(8, vw - r.width - 8);
    if (py + r.height > vh - 8) py = Math.max(8, y - r.height - 16);
    setPos({ x: px, y: py });
  }, [x, y]);

  const words = note ? (note.plainText?.split(/\s+/).filter(Boolean).length || 0) : 0;

  return createPortal(
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.98 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed z-[70] w-[300px] overflow-hidden rounded-lg border border-border bg-popover shadow-2xl"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
      role="dialog"
      aria-label={`Preview of ${title}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {note?.icon ? (
            <span className="shrink-0 text-base">{note.icon}</span>
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <p className="truncate text-[13px] font-semibold">{note?.title || title}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 font-mono text-[9px]">
          [&#91; &#93;]
        </Badge>
      </div>

      {note ? (
        <div className="p-3">
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-4">
            {note.plainText?.slice(0, 240) || "Empty note"}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-muted-foreground tabular-nums">
            <span>{words.toLocaleString()} {words === 1 ? "word" : "words"}</span>
            <span aria-hidden>·</span>
            <span>{calculateReadingTime(note.plainText || "")} min read</span>
            <span aria-hidden>·</span>
            <span>{formatDate(note.updatedAt)}</span>
          </div>

          {note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {note.tags.slice(0, 4).map((t) => (
                <Badge key={t.id} variant="secondary" className="gap-1 text-[9px]">
                  <Hash className="h-2.5 w-2.5" />
                  {t.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => onOpen(note)}>
              Open
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            No note named <span className="font-medium text-foreground">&quot;{title}&quot;</span> yet.
          </p>
          <div className="mt-3">
            <Button size="sm" className="w-full" onClick={onCreate}>
              <Plus className="h-3 w-3" />
              Create note
            </Button>
          </div>
        </div>
      )}

    </motion.div>,
    document.body
  );
}
