import { create } from "zustand";
import type { Note } from "@/types";
import { generateId, extractWikiLinks } from "@/lib/utils";

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  searchQuery: string;
  searchResults: Note[];
  selectedNotes: Set<string>;
  sortBy: "updatedAt" | "createdAt" | "title";
  sortOrder: "asc" | "desc";
  filterTag: string | null;
  filterFolder: string | null;
  lastSavedAt: string | null;
  editorReloadToken: number;
  bumpEditorReload: () => void;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Note[]) => void;
  toggleNoteSelection: (id: string) => void;
  selectAllNotes: () => void;
  clearSelection: () => void;
  setSortBy: (sort: "updatedAt" | "createdAt" | "title") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setFilterTag: (tag: string | null) => void;
  setFilterFolder: (folder: string | null) => void;
  getFilteredNotes: () => Note[];
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  moveToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  syncLinks: (noteId: string) => void;
  syncBacklinks: () => void;
}

const loadNotes = (): Note[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("neuronotes-notes");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
};

const saveNotes = (notes: Note[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-notes", JSON.stringify(notes));
  } catch {}
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: loadNotes(),
  currentNote: null,
  searchQuery: "",
  searchResults: [],
  selectedNotes: new Set(),
  sortBy: "updatedAt",
  sortOrder: "desc",
  filterTag: null,
  filterFolder: null,
  lastSavedAt: null,
  editorReloadToken: 0,

  bumpEditorReload: () =>
    set((state) => ({ editorReloadToken: state.editorReloadToken + 1 })),

  setNotes: (notes) => {
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  addNote: (note) => {
    const notes = [note, ...get().notes];
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  updateNote: (id, updates) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    saveNotes(notes);
    const currentNote =
      get().currentNote?.id === id
        ? { ...get().currentNote!, ...updates, updatedAt: new Date().toISOString() }
        : get().currentNote;
    set({ notes, currentNote, lastSavedAt: new Date().toISOString() });
  },

  deleteNote: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id
        ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() }
        : n
    );
    saveNotes(notes);
    const currentNote =
      get().currentNote?.id === id ? null : get().currentNote;
    set({ notes, currentNote, lastSavedAt: new Date().toISOString() });
  },

  setCurrentNote: (note) => set({ currentNote: note }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    const lower = query.toLowerCase();
    const results = get().notes.filter(
      (n) =>
        !n.isDeleted &&
        (n.title.toLowerCase().includes(lower) ||
          n.plainText?.toLowerCase().includes(lower) ||
          n.tags.some((t) => t.name.toLowerCase().includes(lower)))
    );
    set({ searchResults: results });
  },

  setSearchResults: (results) => set({ searchResults: results }),

  toggleNoteSelection: (id) =>
    set((state) => {
      const selected = new Set(state.selectedNotes);
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      return { selectedNotes: selected };
    }),

  selectAllNotes: () =>
    set((state) => ({
      selectedNotes: new Set(
        state.notes.filter((n) => !n.isDeleted).map((n) => n.id)
      ),
    })),

  clearSelection: () => set({ selectedNotes: new Set() }),

  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setFilterTag: (tag) => set({ filterTag: tag }),
  setFilterFolder: (folder) => set({ filterFolder: folder }),

  getFilteredNotes: () => {
    const { notes, sortBy, sortOrder, filterTag, filterFolder } = get();
    let filtered = notes.filter((n) => !n.isDeleted && !n.isArchived);

    if (filterTag) {
      filtered = filtered.filter((n) =>
        n.tags.some((t) => t.name === filterTag)
      );
    }
    if (filterFolder) {
      filtered = filtered.filter((n) => n.folderId === filterFolder);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") comparison = a.title.localeCompare(b.title);
      else if (sortBy === "createdAt")
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  },

  togglePin: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  toggleFavorite: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
    );
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  toggleArchive: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isArchived: !n.isArchived } : n
    );
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  moveToTrash: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id
        ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() }
        : n
    );
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  restoreFromTrash: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n
    );
    saveNotes(notes);
    set({ notes, lastSavedAt: new Date().toISOString() });
  },

  /**
   * Recompute a note's `links` from the [[wiki-links]] in its plain text,
   * resolving titles to note ids. No-op when nothing changed.
   */
  syncLinks: (noteId) => {
    const { notes } = get();
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const titles = extractWikiLinks(note.plainText ?? "");
    const links = titles.map((title) => {
      const target = notes.find(
        (n) => !n.isDeleted && n.title.toLowerCase() === title.toLowerCase()
      );
      return {
        id: generateId(),
        sourceNoteId: noteId,
        targetNoteId: target?.id ?? `unresolved:${title}`,
        label: title,
      };
    });

    const same =
      links.length === note.links.length &&
      links.every((l, i) => l.targetNoteId === note.links[i]?.targetNoteId);
    if (same) return;

    const updated = notes.map((n) =>
      n.id === noteId ? { ...n, links } : n
    );
    saveNotes(updated);
    set({ notes: updated, lastSavedAt: new Date().toISOString() });
    get().syncBacklinks();
  },

  /**
   * Recompute the `backlinks` array of every note based on the `links`
   * ([[wiki-links]]) found in all notes. Cheap single pass over in-memory
   * notes; skips writes when nothing changed.
   */
  syncBacklinks: () => {
    const { notes } = get();
    const updated = notes.map((n) => {
      const sources = notes.filter(
        (o) => o.id !== n.id && o.links.some((l) => l.targetNoteId === n.id)
      );
      if (sources.length === 0 && n.backlinks.length === 0) return n;
      const existing = new Map(n.backlinks.map((b) => [b.sourceNoteId, b]));
      const backlinks = sources.map((o) => {
        const prev = existing.get(o.id);
        if (prev) return prev;
        return {
          id: generateId(),
          sourceNoteId: o.id,
          targetNoteId: n.id,
          label: o.title,
        };
      });
      const same =
        backlinks.length === n.backlinks.length &&
        backlinks.every((b, i) => b.sourceNoteId === n.backlinks[i]?.sourceNoteId);
      return same ? n : { ...n, backlinks };
    });

    const changed = updated.some((n, i) => n !== notes[i]);
    if (!changed) return;

    saveNotes(updated);
    const currentNote = get().currentNote;
    set({
      notes: updated,
      lastSavedAt: new Date().toISOString(),
      currentNote: currentNote
        ? updated.find((n) => n.id === currentNote.id) ?? currentNote
        : currentNote,
    });
  },
}));
