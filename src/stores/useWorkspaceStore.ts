import { create } from "zustand";
import type { Workspace, Folder } from "@/types";
import { generateId } from "@/lib/utils";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  folders: Folder[];
  expandedFolders: Set<string>;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">) => Workspace;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Omit<Folder, "id" | "createdAt" | "updatedAt">) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
  toggleFolderExpanded: (id: string) => void;
  getRootFolders: () => Folder[];
  getSubFolders: (parentId: string) => Folder[];
}

const loadWorkspaces = (): Workspace[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("neuronotes-workspaces");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      // Normalize older saved data so missing fields never crash the UI.
      return parsed.map((w) => ({
        id: w.id ?? generateId(),
        name: w.name ?? "Default",
        description: w.description,
        icon: w.icon,
        color: w.color,
        createdAt: w.createdAt ?? new Date().toISOString(),
        updatedAt: w.updatedAt ?? new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
};

const loadFolders = (): Folder[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("neuronotes-folders");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      // Normalize older saved data so missing fields never crash the UI.
      return parsed.map((f) => ({
        id: f.id ?? generateId(),
        name: f.name ?? "New Folder",
        parentId: f.parentId ?? null,
        workspaceId: f.workspaceId ?? "default",
        icon: f.icon,
        color: f.color,
        createdAt: f.createdAt ?? new Date().toISOString(),
        updatedAt: f.updatedAt ?? new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
};

const saveWorkspaces = (workspaces: Workspace[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-workspaces", JSON.stringify(workspaces));
  } catch {}
};

const saveFolders = (folders: Folder[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-folders", JSON.stringify(folders));
  } catch {}
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: loadWorkspaces(),
  currentWorkspace: null,
  folders: loadFolders(),
  expandedFolders: new Set(),

  setWorkspaces: (workspaces) => {
    saveWorkspaces(workspaces);
    set({ workspaces });
  },

  addWorkspace: (data) => {
    const now = new Date().toISOString();
    const workspace: Workspace = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const workspaces = [...get().workspaces, workspace];
    saveWorkspaces(workspaces);
    set({ workspaces });
    return workspace;
  },

  updateWorkspace: (id, updates) => {
    const workspaces = get().workspaces.map((w) =>
      w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
    );
    saveWorkspaces(workspaces);
    set({ workspaces });
  },

  deleteWorkspace: (id) => {
    const workspaces = get().workspaces.filter((w) => w.id !== id);
    saveWorkspaces(workspaces);
    set({ workspaces });
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  setFolders: (folders) => {
    saveFolders(folders);
    set({ folders });
  },

  addFolder: (data) => {
    const now = new Date().toISOString();
    const folder: Folder = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const folders = [...get().folders, folder];
    saveFolders(folders);
    set({ folders });
    return folder;
  },

  updateFolder: (id, updates) => {
    const folders = get().folders.map((f) =>
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    );
    saveFolders(folders);
    set({ folders });
  },

  deleteFolder: (id) => {
    const folders = get().folders.filter((f) => f.id !== id);
    saveFolders(folders);
    set({ folders });
  },

  toggleFolderExpanded: (id) =>
    set((state) => {
      const expanded = new Set(state.expandedFolders);
      if (expanded.has(id)) expanded.delete(id);
      else expanded.add(id);
      return { expandedFolders: expanded };
    }),

  getRootFolders: () => {
    const { folders, currentWorkspace } = get();
    if (!currentWorkspace) return [];
    return folders.filter(
      (f) => f.parentId === null && f.workspaceId === currentWorkspace.id
    );
  },

  getSubFolders: (parentId) => {
    return get().folders.filter((f) => f.parentId === parentId);
  },
}));
