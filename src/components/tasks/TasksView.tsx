"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Filter,
  Calendar,
  Flag,
  Trash2,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTaskStore, useUIStore } from "@/stores";
import { cn, formatDate } from "@/lib/utils";
import type { Task, TaskStatus, Priority } from "@/types";

const priorityConfig: Record<Priority, { color: string; icon: React.ReactNode; label: string }> = {
  none: { color: "text-muted-foreground", icon: <Circle className="h-3.5 w-3.5" />, label: "None" },
  low: { color: "text-blue-500", icon: <Flag className="h-3.5 w-3.5" />, label: "Low" },
  medium: { color: "text-yellow-500", icon: <Flag className="h-3.5 w-3.5" />, label: "Medium" },
  high: { color: "text-orange-500", icon: <Flag className="h-3.5 w-3.5" />, label: "High" },
  urgent: { color: "text-red-500", icon: <AlertTriangle className="h-3.5 w-3.5" />, label: "Urgent" },
};

const statusConfig: Record<TaskStatus, { icon: React.ReactNode; color: string; label: string }> = {
  todo: { icon: <Circle className="h-4 w-4" />, color: "text-muted-foreground", label: "To Do" },
  in_progress: { icon: <Clock className="h-4 w-4" />, color: "text-blue-500", label: "In Progress" },
  done: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-500", label: "Done" },
  cancelled: { icon: <Circle className="h-4 w-4 line-through" />, color: "text-muted-foreground", label: "Cancelled" },
};

function TaskItem({ task }: { task: Task }) {
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleTaskStatus = useTaskStore((s) => s.toggleTaskStatus);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-card/30 p-3 hover:bg-accent/30 transition-all",
        task.status === "done" && "opacity-60"
      )}
    >
      <button
        onClick={() => toggleTaskStatus(task.id)}
        className={cn("shrink-0 transition-colors", statusConfig[task.status].color)}
      >
        {statusConfig[task.status].icon}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            task.status === "done" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {task.priority !== "none" && (
          <Badge
            variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "warning" : "secondary"}
            className="text-[10px]"
          >
            {task.priority}
          </Badge>
        )}
        {task.dueDate && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function TaskColumn({
  title,
  status,
  tasks,
  icon,
}: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/20 p-3 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={statusConfig[status].color}>{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-[10px]">
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div className="space-y-2 flex-1 min-h-[100px]">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

export function TasksView() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const showToast = useUIStore((s) => s.showToast);

  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"board" | "list">("board");
  const [filterPriority, setFilterPriority] = React.useState<Priority | null>(null);

  const filteredTasks = React.useMemo(() => {
    let result = tasks.filter((t) => !t.subtasks.length);
    if (filterPriority) {
      result = result.filter((t) => t.priority === filterPriority);
    }
    return result;
  }, [tasks, filterPriority]);

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: filteredTasks.filter((t) => t.status === "todo"),
    in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
    done: filteredTasks.filter((t) => t.status === "done"),
    cancelled: filteredTasks.filter((t) => t.status === "cancelled"),
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle.trim(),
      status: "todo",
      priority: "none",
      workspaceId: "default",
      isRecurring: false,
      tags: [],
    });
    setNewTaskTitle("");
    showToast("Task created", "success");
  };

  const completedCount = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.filter((t) => !t.subtasks.length).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <ScrollArea className="h-full">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedCount} of {totalCount} completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu
              trigger={
                <Button variant="outline" size="sm">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Filter
                </Button>
              }
            >
              <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {(["urgent", "high", "medium", "low", "none"] as Priority[]).map((p) => (
                <DropdownMenuItem key={p} onClick={() => setFilterPriority(p)}>
                  <span className={priorityConfig[p].color}>{priorityConfig[p].icon}</span>
                  {priorityConfig[p].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
            <Button
              variant={viewMode === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("board")}
            >
              Board
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Add Task */}
        <div className="flex items-center gap-2">
          <Input
            icon={<Plus className="h-4 w-4" />}
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTask();
            }}
            className="max-w-md"
          />
          <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
            Add
          </Button>
        </div>

        {/* Board View */}
        {viewMode === "board" ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            <TaskColumn
              title="To Do"
              status="todo"
              tasks={tasksByStatus.todo}
              icon={<Circle className="h-4 w-4" />}
            />
            <TaskColumn
              title="In Progress"
              status="in_progress"
              tasks={tasksByStatus.in_progress}
              icon={<Clock className="h-4 w-4" />}
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={tasksByStatus.done}
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
          </div>
        ) : (
          /* List View */
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </AnimatePresence>
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ListTodo className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No tasks</h3>
                <p className="text-sm text-muted-foreground">Create a task to get started</p>
              </div>
            )}
          </div>
        )}

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
