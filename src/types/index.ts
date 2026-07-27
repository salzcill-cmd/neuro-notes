export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  workspaceId: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
  notes?: Note[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  plainText?: string;
  folderId: string | null;
  workspaceId: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  color?: string;
  icon?: string;
  coverImage?: string;
  tags: Tag[];
  backlinks: NoteLink[];
  links: NoteLink[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NoteLink {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  sourceBlockId?: string;
  label?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  parentId: string | null;
  workspaceId: string;
  createdAt: string;
  children?: Tag[];
}

export interface Block {
  id: string;
  noteId: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  noteId?: string;
  workspaceId: string;
  dueDate?: string;
  reminder?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  tags: Tag[];
  subtasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  icon?: string;
  category: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "note" | "tag" | "folder" | "project";
  color?: string;
  size?: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: "note" | "task" | "tag" | "template";
  highlight?: string;
  score: number;
  updatedAt: string;
}

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  category: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface AppSettings {
  theme: Theme;
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  showLineNumber: boolean;
  spellCheck: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  markdownShortcuts: boolean;
  defaultView: "edit" | "preview" | "split";
  reducedMotion: boolean;
  language: string;
}

export type Theme = "dark" | "light" | "oled" | "system";

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  allDay: boolean;
  color?: string;
  noteId?: string;
  taskId?: string;
  workspaceId: string;
}

export interface CanvasNode {
  id: string;
  type: "note" | "card" | "image" | "text" | "link";
  x: number;
  y: number;
  width: number;
  height: number;
  data: Record<string, unknown>;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

export interface WritingStats {
  totalWords: number;
  totalNotes: number;
  wordsToday: number;
  notesToday: number;
  streakDays: number;
  avgWordsPerDay: number;
  totalWritingTime: number;
}
