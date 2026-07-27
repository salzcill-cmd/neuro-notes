import { create } from "zustand";
import type { Tag } from "@/types";
import { generateId } from "@/lib/utils";

interface TagState {
  tags: Tag[];
  currentTag: Tag | null;
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Omit<Tag, "id" | "createdAt">) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  setCurrentTag: (tag: Tag | null) => void;
  getTagByName: (name: string) => Tag | undefined;
  getRootTags: () => Tag[];
  getSubTags: (parentId: string) => Tag[];
}

const loadTags = (): Tag[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("neuronotes-tags");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
};

const saveTags = (tags: Tag[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-tags", JSON.stringify(tags));
  } catch {}
};

export const useTagStore = create<TagState>((set, get) => ({
  tags: loadTags(),
  currentTag: null,

  setTags: (tags) => {
    saveTags(tags);
    set({ tags });
  },

  addTag: (data) => {
    const tag: Tag = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const tags = [...get().tags, tag];
    saveTags(tags);
    set({ tags });
    return tag;
  },

  updateTag: (id, updates) => {
    const tags = get().tags.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    );
    saveTags(tags);
    set({ tags });
  },

  deleteTag: (id) => {
    const tags = get().tags.filter((t) => t.id !== id);
    saveTags(tags);
    set({ tags });
  },

  setCurrentTag: (tag) => set({ currentTag: tag }),

  getTagByName: (name) => get().tags.find((t) => t.name === name),

  getRootTags: () => get().tags.filter((t) => t.parentId === null),
  getSubTags: (parentId) => get().tags.filter((t) => t.parentId === parentId),
}));
