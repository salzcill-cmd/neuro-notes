import { create } from "zustand";
import type { Note, Tag } from "@/types";

interface NoteState {
  notes: Note[];
  currentNote: Note | null;
  recentNotes: Note[];
  favoriteNotes: Note[];
  pinnedNotes: Note[];
  searchQuery: string;
  searchResults: Note[];
  selectedNotes: Set<string>;
  sortBy: "updatedAt" | "createdAt" | "title";
  sortOrder: "asc" | "desc";
  filterTag: string | null;
  filterFolder: string | null;
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
  recentNotes: [],
  favoriteNotes: [],
  pinnedNotes: [],
  searchQuery: "",
  searchResults: [],
  selectedNotes: new Set(),
  sortBy: "updatedAt",
  sortOrder: "desc",
  filterTag: null,
  filterFolder: null,

  setNotes: (notes) => {
    saveNotes(notes);
    set({ notes });
  },

  addNote: (note) => {
    const notes = [note, ...get().notes];
    saveNotes(notes);
    set({ notes });
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
    set({ notes, currentNote });
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
    set({ notes, currentNote });
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
    set({ notes });
  },

  toggleFavorite: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isFavorite: !n.isFavorite } : n
    );
    saveNotes(notes);
    set({ notes });
  },

  toggleArchive: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isArchived: !n.isArchived } : n
    );
    saveNotes(notes);
    set({ notes });
  },

  moveToTrash: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id
        ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() }
        : n
    );
    saveNotes(notes);
    set({ notes });
  },

  restoreFromTrash: (id) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n
    );
    saveNotes(notes);
    set({ notes });
  },
}));
