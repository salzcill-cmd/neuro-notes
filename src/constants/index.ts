export const APP_NAME = "NeuroNotes";
export const APP_DESCRIPTION = "Your Second Brain - AI-Powered Knowledge Management Platform";
export const APP_VERSION = "1.0.0";

export const DEFAULT_SHORTCUTS = {
  COMMAND_PALETTE: { key: "Meta+k", label: "Command Palette" },
  NEW_NOTE: { key: "Meta+n", label: "New Note" },
  SEARCH: { key: "Meta+Shift+f", label: "Search" },
  TOGGLE_SIDEBAR: { key: "Meta+\\", label: "Toggle Sidebar" },
  SAVE: { key: "Meta+s", label: "Save" },
  ZEN_MODE: { key: "Meta+Shift+z", label: "Zen Mode" },
  FOCUS_MODE: { key: "Meta+Shift+f", label: "Focus Mode" },
  DAILY_NOTE: { key: "Meta+d", label: "Daily Note" },
  GRAPH_VIEW: { key: "Meta+g", label: "Graph View" },
  QUICK_SWITCHER: { key: "Meta+p", label: "Quick Switcher" },
} as const;

export const SIDEBAR_WIDTH = {
  MIN: 200,
  DEFAULT: 260,
  MAX: 400,
} as const;

export const NOTE_COLORS = [
  "transparent",
  "#fca5a5",
  "#fdba74",
  "#fde047",
  "#86efac",
  "#67e8f9",
  "#93c5fd",
  "#c4b5fd",
  "#f0abfc",
] as const;

export const PRIORITY_LEVELS = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  URGENT: 4,
} as const;

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;

export const BLOCK_TYPES = [
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "taskList",
  "codeBlock",
  "blockquote",
  "horizontalRule",
  "image",
  "table",
  "callout",
] as const;

export const EXPORT_FORMATS = ["markdown", "html", "json", "pdf"] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;
