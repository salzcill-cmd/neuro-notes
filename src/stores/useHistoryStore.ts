import { create } from "zustand";
import { useNoteStore } from "./useNoteStore";
import { generateId } from "@/lib/utils";

export interface NoteSnapshot {
  id: string;
  noteId: string;
  title: string;
  content: string;
  plainText: string;
  wordCount: number;
  createdAt: string;
}

const SNAPSHOT_LIMIT = 40;
const SNAPSHOT_INTERVAL_MS = 60_000;

interface HistoryState {
  /** noteId -> snapshots, oldest first */
  snapshots: Record<string, NoteSnapshot[]>;
  addSnapshot: (noteId: string, content: string, plainText: string) => void;
  getSnapshots: (noteId: string) => NoteSnapshot[];
  restoreSnapshot: (noteId: string, snapshotId: string) => void;
  clearNoteHistory: (noteId: string) => void;
}

const loadHistory = (): Record<string, NoteSnapshot[]> => {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("neuronotes-history");
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
};

const saveHistory = (snapshots: Record<string, NoteSnapshot[]>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-history", JSON.stringify(snapshots));
  } catch {}
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  snapshots: loadHistory(),

  addSnapshot: (noteId, content, plainText) => {
    const note = useNoteStore.getState().notes.find((n) => n.id === noteId);
    if (!note || !content.trim()) return;

    const list = get().snapshots[noteId] || [];
    const last = list[list.length - 1];
    if (last && last.content === content) return;
    if (last && Date.now() - new Date(last.createdAt).getTime() < SNAPSHOT_INTERVAL_MS) {
      return;
    }

    const snapshot: NoteSnapshot = {
      id: generateId(),
      noteId,
      title: note.title,
      content,
      plainText,
      wordCount: plainText.split(/\s+/).filter(Boolean).length,
      createdAt: new Date().toISOString(),
    };

    const next = { ...get().snapshots };
    next[noteId] = [...list, snapshot].slice(-SNAPSHOT_LIMIT);
    saveHistory(next);
    set({ snapshots: next });
  },

  getSnapshots: (noteId) => {
    const list = get().snapshots[noteId] || [];
    // Return newest first for the UI.
    return [...list].reverse();
  },

  restoreSnapshot: (noteId, snapshotId) => {
    const list = get().snapshots[noteId] || [];
    const snapshot = list.find((s) => s.id === snapshotId);
    if (!snapshot) return;

    const store = useNoteStore.getState();
    const current = store.notes.find((n) => n.id === noteId);

    // Keep the current state recoverable: push it to history first.
    if (current && current.content !== snapshot.content) {
      get().addSnapshot(noteId, current.content, current.plainText || "");
    }

    store.updateNote(noteId, {
      title: snapshot.title,
      content: snapshot.content,
      plainText: snapshot.plainText,
    });
    store.syncLinks(noteId);
    store.bumpEditorReload();
  },

  clearNoteHistory: (noteId) => {
    const next = { ...get().snapshots };
    delete next[noteId];
    saveHistory(next);
    set({ snapshots: next });
  },
}));
