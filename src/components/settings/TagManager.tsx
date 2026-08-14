"use client";

import * as React from "react";
import { Tag as TagIcon, Pencil, Trash2, GitMerge, Check, X, Hash } from "lucide-react";
import { useTagStore, useNoteStore, useTaskStore, useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

interface TagManagerProps {
  onClose?: () => void;
}

const TAG_COLORS = [
  { value: "217 91% 60%", className: "bg-blue-500" },
  { value: "189 94% 43%", className: "bg-cyan-500" },
  { value: "160 84% 39%", className: "bg-emerald-500" },
  { value: "38 92% 50%", className: "bg-amber-500" },
  { value: "0 84% 60%", className: "bg-red-500" },
  { value: "330 81% 60%", className: "bg-pink-500" },
];

function tagStyle(color?: string) {
  return color
    ? { backgroundColor: `hsl(${color} / 0.15)`, color: `hsl(${color})` }
    : undefined;
}

/**
 * Manage tags across the whole vault: rename, merge, delete, recolor.
 * Every change propagates to all notes & tasks that use the tag.
 */
export function TagManager({ onClose }: TagManagerProps) {
  const tags = useTagStore((s) => s.tags);
  const notes = useNoteStore((s) => s.notes);
  const tasks = useTaskStore((s) => s.tasks);
  const showToast = useUIStore((s) => s.showToast);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [mergeId, setMergeId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  // Count usages across notes & tasks.
  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    const bump = (name: string) => map.set(name, (map.get(name) ?? 0) + 1);
    notes.filter((n) => !n.isDeleted).forEach((n) => n.tags.forEach((t) => bump(t.name)));
    tasks.forEach((t) => t.tags.forEach((tag) => bump(tag.name)));
    return map;
  }, [notes, tasks]);

  const allNames = tags.map((t) => t.name.toLowerCase());

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const commitEdit = (id: string) => {
    const name = editName.trim();
    if (name && !allNames.some((n) => n === name.toLowerCase())) {
      useTagStore.getState().renameTag(id, name);
      showToast(`Tag renamed to #${name}`, "success");
    }
    setEditingId(null);
  };

  const handleMerge = (sourceId: string) => {
    if (!mergeId) return;
    const source = tags.find((t) => t.id === sourceId);
    const target = tags.find((t) => t.id === mergeId);
    useTagStore.getState().mergeTags(sourceId, mergeId);
    setMergeId(null);
    if (source && target) {
      showToast(`Merged #${source.name} into #${target.name}`, "success");
    }
  };

  const handleDelete = (id: string) => {
    const tag = tags.find((t) => t.id === id);
    useTagStore.getState().deleteTag(id);
    setConfirmDelete(null);
    if (tag) showToast(`Deleted tag #${tag.name}`, "success");
  };

  const handleColor = (id: string, color: string) => {
    useTagStore.getState().updateTag(id, { color });
  };

  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <TagIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No tags yet</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Add tags to notes in the editor&apos;s Properties panel, then manage them here.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {tags.length} {tags.length === 1 ? "tag" : "tags"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Rename, merge &amp; delete — applied to all notes
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        {tags.map((tag) => {
          const count = counts.get(tag.name) ?? 0;
          const isEditing = editingId === tag.id;
          return (
            <div
              key={tag.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors",
                isEditing && "border-primary/40 bg-accent/30"
              )}
            >
              {isEditing ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit(tag.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-7 flex-1 rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                  placeholder="Tag name"
                />
              ) : (
                <>
                  <span
                    className="inline-flex max-w-[40%] items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-xs font-medium"
                    style={tagStyle(tag.color)}
                  >
                    <Hash className="h-3 w-3 shrink-0" />
                    <span className="truncate">{tag.name}</span>
                  </span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {count} {count === 1 ? "note" : "notes"}
                  </span>
                </>
              )}

              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                {!isEditing && (
                  <>
                    <div className="mr-1 hidden items-center gap-0.5 group-hover:flex">
                      {TAG_COLORS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => handleColor(tag.id, c.value)}
                          className={cn(
                            "h-3.5 w-3.5 rounded-full transition-transform hover:scale-125",
                            c.className,
                            tag.color === c.value && "ring-2 ring-ring"
                          )}
                          aria-label="Set tag color"
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => startEdit(tag.id, tag.name)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="Rename tag"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setMergeId(tag.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="Merge tag"
                    >
                      <GitMerge className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(tag.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      aria-label="Delete tag"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => commitEdit(tag.id)}
                    className="rounded p-1 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    aria-label="Confirm rename"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    aria-label="Cancel rename"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mergeId && (
        <div className="mt-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="mb-2 text-xs font-medium">Merge into…</p>
          <div className="flex flex-wrap gap-1.5">
            {tags
              .filter((t) => t.id !== mergeId)
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleMerge(mergeId)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  {t.name}
                </button>
              ))}
          </div>
          <button
            onClick={() => setMergeId(null)}
            className="mt-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <p className="mb-2 text-xs font-medium text-red-500">
            Delete this tag? It will be removed from all notes &amp; tasks.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDelete(confirmDelete)}
              className="rounded-md bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="rounded-md border border-border px-3 py-1 text-xs hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
