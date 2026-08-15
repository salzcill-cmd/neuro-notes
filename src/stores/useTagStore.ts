import { create } from "zustand";
import type { Tag } from "@/types";
import { sanitizeDateString } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import { useNoteStore, useTaskStore } from "./index";

interface TagState {
  tags: Tag[];
  currentTag: Tag | null;
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Omit<Tag, "id" | "createdAt">) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  renameTag: (id: string, newName: string) => void;
  mergeTags: (sourceId: string, targetId: string) => void;
  setCurrentTag: (tag: Tag | null) => void;
  getTagByName: (name: string) => Tag | undefined;
  getRootTags: () => Tag[];
  getSubTags: (parentId: string) => Tag[];
}

const loadTags = (): Tag[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("neuronotes-tags");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      // Normalize older saved data (missing fields -> safe defaults).
      return parsed.map((t) => ({
        id: t.id ?? generateId(),
        name: t.name ?? "untitled",
        color: t.color,
        parentId: t.parentId ?? null,
        workspaceId: t.workspaceId ?? "default",
        createdAt: sanitizeDateString(t.createdAt) ?? new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
};

const saveTags = (tags: Tag[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-tags", JSON.stringify(tags));
  } catch {}
};

/**
 * Rebuild the `tags: Tag[]` array on notes & tasks so tag edits
 * (rename / merge / delete) propagate everywhere.
 */
const syncEntityTags = (
  nameOrReplace: { oldName: string; replacement: Tag | null },
  scope: "all" | "notes" | "tasks"
) => {
  if (typeof window === "undefined") return;
  const { oldName, replacement } = nameOrReplace;
  const apply = <T extends { tags: Tag[] }>(list: T[]): T[] =>
    list.map((entity) => {
      if (!entity.tags.some((t) => t.name === oldName)) return entity;
      if (!replacement) {
        return { ...entity, tags: entity.tags.filter((t) => t.name !== oldName) };
      }
      return {
        ...entity,
        tags: entity.tags.map((t) =>
          t.name === oldName ? { ...t, ...replacement } : t
        ),
      };
    });

  if (scope !== "tasks") {
    const noteStore = useNoteStore.getState();
    noteStore.setNotes(apply(noteStore.notes));
  }
  if (scope !== "notes") {
    const taskStore = useTaskStore.getState();
    taskStore.setTasks(apply(taskStore.tasks));
  }
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
    const tag = get().tags.find((t) => t.id === id);
    const tags = get().tags.filter((t) => t.id !== id);
    saveTags(tags);
    set({ tags });
    if (tag) syncEntityTags({ oldName: tag.name, replacement: null }, "all");
  },

  renameTag: (id, newName) => {
    const clean = newName.trim();
    const tag = get().tags.find((t) => t.id === id);
    if (!tag || !clean || clean.toLowerCase() === tag.name.toLowerCase()) return;
    // Merge into an existing tag with the same name instead of duplicating.
    const existing = get().tags.find(
      (t) => t.id !== id && t.name.toLowerCase() === clean.toLowerCase()
    );
    if (existing) {
      get().mergeTags(id, existing.id);
      return;
    }
    const updated = { ...tag, name: clean };
    const tags = get().tags.map((t) => (t.id === id ? updated : t));
    saveTags(tags);
    set({ tags });
    syncEntityTags({ oldName: tag.name, replacement: updated }, "all");
  },

  mergeTags: (sourceId, targetId) => {
    if (sourceId === targetId) return;
    const source = get().tags.find((t) => t.id === sourceId);
    const target = get().tags.find((t) => t.id === targetId);
    if (!source || !target) return;

    // Re-parent children of the source tag onto the target.
    let tags = get().tags.map((t) =>
      t.parentId === sourceId ? { ...t, parentId: targetId } : t
    );
    tags = tags.filter((t) => t.id !== sourceId);
    saveTags(tags);
    set({ tags });
    syncEntityTags({ oldName: source.name, replacement: target }, "all");
  },

  setCurrentTag: (tag) => set({ currentTag: tag }),

  getTagByName: (name) => get().tags.find((t) => t.name === name),

  getRootTags: () => get().tags.filter((t) => t.parentId === null),
  getSubTags: (parentId) => get().tags.filter((t) => t.parentId === parentId),
}));
