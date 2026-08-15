import { create } from "zustand";
import type { Task, TaskStatus, Priority } from "@/types";
import { generateId, sanitizeDateString } from "@/lib/utils";

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  filterStatus: TaskStatus | null;
  filterPriority: Priority | null;
  sortBy: "dueDate" | "priority" | "createdAt" | "title";
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "subtasks">) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  setFilterStatus: (status: TaskStatus | null) => void;
  setFilterPriority: (priority: Priority | null) => void;
  setSortBy: (sort: "dueDate" | "priority" | "createdAt" | "title") => void;
  getFilteredTasks: () => Task[];
  addSubtask: (parentId: string, title: string) => void;
  toggleTaskStatus: (id: string) => void;
}

const loadTasks = (): Task[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("neuronotes-tasks");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      // Normalize older saved data so missing fields never crash the UI.
      return parsed.map((t) => ({
        id: t.id ?? generateId(),
        title: t.title ?? "Untitled task",
        description: t.description,
        status: t.status ?? "todo",
        priority: t.priority ?? "none",
        noteId: t.noteId,
        workspaceId: t.workspaceId ?? "default",
        dueDate: sanitizeDateString(t.dueDate) ?? undefined,
        reminder: t.reminder,
        isRecurring: !!t.isRecurring,
        recurringPattern: t.recurringPattern,
        tags: Array.isArray(t.tags) ? t.tags : [],
        subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
        createdAt: sanitizeDateString(t.createdAt) ?? new Date().toISOString(),
        updatedAt: sanitizeDateString(t.updatedAt) ?? new Date().toISOString(),
      }));
    }
  } catch {}
  return [];
};

const saveTasks = (tasks: Task[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("neuronotes-tasks", JSON.stringify(tasks));
  } catch {}
};

const priorityWeight: Record<Priority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: loadTasks(),
  currentTask: null,
  filterStatus: null,
  filterPriority: null,
  sortBy: "dueDate",

  setTasks: (tasks) => {
    saveTasks(tasks);
    set({ tasks });
  },

  addTask: (data) => {
    const now = new Date().toISOString();
    const task: Task = {
      ...data,
      id: generateId(),
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    const tasks = [task, ...get().tasks];
    saveTasks(tasks);
    set({ tasks });
    return task;
  },

  updateTask: (id, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    saveTasks(tasks);
    set({ tasks });
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    set({ tasks });
  },

  setCurrentTask: (task) => set({ currentTask: task }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setSortBy: (sort) => set({ sortBy: sort }),

  getFilteredTasks: () => {
    const { tasks, filterStatus, filterPriority, sortBy } = get();
    let filtered = tasks.filter((t) => !t.subtasks.length);

    if (filterStatus) filtered = filtered.filter((t) => t.status === filterStatus);
    if (filterPriority)
      filtered = filtered.filter((t) => t.priority === filterPriority);

    filtered.sort((a, b) => {
      if (sortBy === "priority")
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  },

  addSubtask: (parentId, title) => {
    const now = new Date().toISOString();
    const subtask: Task = {
      id: generateId(),
      title,
      status: "todo",
      priority: "none",
      workspaceId: "",
      isRecurring: false,
      tags: [],
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    const tasks = get().tasks.map((t) =>
      t.id === parentId
        ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: now }
        : t
    );
    saveTasks(tasks);
    set({ tasks });
  },

  toggleTaskStatus: (id) => {
    const tasks = get().tasks.map((t) => {
      if (t.id === id) {
        const nextStatus: TaskStatus =
          t.status === "done" ? "todo" : t.status === "todo" ? "in_progress" : "done";
        return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
      }
      return t;
    });
    saveTasks(tasks);
    set({ tasks });
  },
}));
