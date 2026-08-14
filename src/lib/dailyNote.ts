import { useNoteStore, useAppStore } from "@/stores";
import { generateId } from "@/lib/utils";
import type { Note } from "@/types";

/** "2026-08-14" style date key used for daily notes. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function dailyNoteTitle(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const dailyNoteTemplate = (title: string) => {
  return [
    "<h1>" + title + "</h1>",
    "<p></p>",
    "<h2>Today</h2>",
    "<ul><li><p></p></li></ul>",
    "<p></p>",
    "<h2>Notes</h2>",
    "<p></p>",
    "<h2>Tomorrow</h2>",
    "<ul><li><p></p></li></ul>",
  ].join("");
};

/**
 * Open today's daily note — creating it (with a lightweight template) if it
 * doesn't exist yet. Matches by the YYYY-MM-DD title prefix.
 */
export function openDailyNote(): Note {
  const store = useNoteStore.getState();
  const key = todayKey();
  const existing = store.notes.find(
    (n) => !n.isDeleted && n.title.startsWith(key)
  );

  if (existing) {
    useAppStore.getState().setCurrentNoteId(existing.id);
    useAppStore.getState().openTab(existing.id);
    useNoteStore.getState().setCurrentNote(existing);
    return existing;
  }

  const title = dailyNoteTitle();
  const now = new Date().toISOString();
  const note: Note = {
    id: generateId(),
    title: `${key} — ${title}`,
    content: dailyNoteTemplate(title),
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
  store.addNote(note);
  useAppStore.getState().setCurrentNoteId(note.id);
  useAppStore.getState().openTab(note.id);
  useNoteStore.getState().setCurrentNote(note);
  return note;
}
