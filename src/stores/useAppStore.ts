import { create } from "zustand";
import type { AppSettings } from "@/types";

interface AppState {
  settings: AppSettings;
  sidebarOpen: boolean;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  quickSwitcherOpen: boolean;
  zenMode: boolean;
  focusMode: boolean;
  activeView: string;
  isLoading: boolean;
  currentWorkspaceId: string | null;
  currentFolderId: string | null;
  currentNoteId: string | null;
  openTabs: string[];
  activeTab: string | null;
  expandedFolders: Set<string>;
  setSettings: (settings: Partial<AppSettings>) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickSwitcherOpen: (open: boolean) => void;
  setZenMode: (zen: boolean) => void;
  setFocusMode: (focus: boolean) => void;
  setActiveView: (view: string) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentWorkspaceId: (id: string | null) => void;
  setCurrentFolderId: (id: string | null) => void;
  setCurrentNoteId: (id: string | null) => void;
  openTab: (noteId: string) => void;
  closeTab: (noteId: string) => void;
  setActiveTab: (noteId: string | null) => void;
  toggleFolder: (folderId: string) => void;
}

const defaultSettings: AppSettings = {
  theme: "dark",
  accentColor: "217 91% 60%",
  fontSize: 16,
  fontFamily: "Inter",
  lineHeight: 1.75,
  sidebarWidth: 260,
  sidebarCollapsed: false,
  showLineNumber: true,
  spellCheck: true,
  autoSave: true,
  autoSaveDelay: 1000,
  markdownShortcuts: true,
  defaultView: "edit",
  reducedMotion: false,
  language: "en",
};

const loadSettings = (): AppSettings => {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const stored = localStorage.getItem("neuronotes-settings");
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
};

const saveSettings = (settings: AppSettings) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-settings", JSON.stringify(settings));
  } catch {}
};

export const useAppStore = create<AppState>((set) => ({
  settings: loadSettings(),
  sidebarOpen: true,
  sidebarWidth: 260,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  quickSwitcherOpen: false,
  zenMode: false,
  focusMode: false,
  activeView: "notes",
  isLoading: false,
  currentWorkspaceId: null,
  currentFolderId: null,
  currentNoteId: null,
  openTabs: [],
  activeTab: null,
  expandedFolders: new Set(),

  setSettings: (partial) =>
    set((state) => {
      const newSettings = { ...state.settings, ...partial };
      saveSettings(newSettings);
      return { settings: newSettings };
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(400, width)) }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setQuickSwitcherOpen: (open) => set({ quickSwitcherOpen: open }),
  setZenMode: (zen) => set({ zenMode: zen }),
  setFocusMode: (focus) => set({ focusMode: focus }),
  setActiveView: (view) => set({ activeView: view }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),
  setCurrentFolderId: (id) => set({ currentFolderId: id }),
  setCurrentNoteId: (id) => set({ currentNoteId: id }),

  openTab: (noteId) =>
    set((state) => {
      if (state.openTabs.includes(noteId)) {
        return { activeTab: noteId };
      }
      return { openTabs: [...state.openTabs, noteId], activeTab: noteId };
    }),

  closeTab: (noteId) =>
    set((state) => {
      const tabs = state.openTabs.filter((id) => id !== noteId);
      const activeTab =
        state.activeTab === noteId
          ? tabs[tabs.length - 1] ?? null
          : state.activeTab;
      return { openTabs: tabs, activeTab };
    }),

  setActiveTab: (noteId) => set({ activeTab: noteId }),

  toggleFolder: (folderId) =>
    set((state) => {
      const expanded = new Set(state.expandedFolders);
      if (expanded.has(folderId)) {
        expanded.delete(folderId);
      } else {
        expanded.add(folderId);
      }
      return { expandedFolders: expanded };
    }),
}));
