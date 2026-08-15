import { create } from "zustand";
import type * as React from "react";

interface ModalState {
  type: string | null;
  data?: unknown;
}

interface UIState {
  modal: ModalState;
  toast: { message: string; type: "success" | "error" | "warning" | "info" } | null;
  rightPanelOpen: boolean;
  rightPanelTab: string;
  isDragging: boolean;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  setModal: (modal: ModalState) => void;
  closeModal: () => void;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  clearToast: () => void;
  setRightPanelOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setIsDragging: (dragging: boolean) => void;
  setContextMenu: (menu: { x: number; y: number; items: ContextMenuItem[] } | null) => void;
}

interface ContextMenuItem {
  label?: string;
  icon?: React.ReactNode;
  action?: () => void;
  shortcut?: string;
  danger?: boolean;
  separator?: boolean;
}

export const useUIStore = create<UIState>((set) => ({
  modal: { type: null },
  toast: null,
  rightPanelOpen: false,
  rightPanelTab: "properties",
  isDragging: false,
  contextMenu: null,

  setModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: { type: null } }),

  showToast: (message, type = "info") => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },

  clearToast: () => set({ toast: null }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setContextMenu: (menu) => set({ contextMenu: menu }),
}));
