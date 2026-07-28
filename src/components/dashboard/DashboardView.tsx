"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Star,
  Clock,
  CheckSquare,
  TrendingUp,
  PenTool,
  Sparkles,
  Plus,
  ArrowRight,
  BookOpen,
  Zap,
  Calendar,
  Activity,
  Layers,
  GitFork,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoteStore, useTaskStore, useAppStore, useWorkspaceStore } from "@/stores";
import { cn, formatDate, generateId } from "@/lib/utils";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function WidgetCard({ title, icon, className, children, action }: WidgetCardProps) {
  return (
    <motion.div
      {...fadeIn}
      className={cn(
        "rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:border-border/80 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}) {
  return (
    <motion.div {...fadeIn} className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", color)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {change && (
        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
          <TrendingUp className="h-3 w-3" />
          {change}
        </div>
      )}
    </motion.div>
  );
}

export function DashboardView() {
  const notes = useNoteStore((s) => s.notes);
  const tasks = useTaskStore((s) => s.tasks);
  const addNote = useNoteStore((s) => s.addNote);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);
  const favoriteNotes = activeNotes.filter((n) => n.isFavorite);
  const recentNotes = [...activeNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  const handleNewNote = () => {
    const now = new Date().toISOString();
    const note = {
      id: generateId(),
      title: "Untitled",
      content: "",
      plainText: "",
      folderId: null,
      workspaceId: currentWorkspace?.id || "default",
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      tags: [],
      backlinks: [],
      links: [],
      createdAt: now,
      updatedAt: now,
    };
    addNote(note);
    setCurrentNote(note);
    setCurrentNoteId(note.id);
  };

  const totalWords = activeNotes.reduce((acc, n) => acc + (n.plainText?.split(/\s+/).length || 0), 0);
  const totalBacklinks = activeNotes.reduce((acc, n) => acc + n.backlinks.length, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const notesThisWeek = activeNotes.filter((n) => new Date(n.createdAt) > weekAgo).length;
  const wordsThisWeek = activeNotes
    .filter((n) => new Date(n.updatedAt) > weekAgo)
    .reduce((acc, n) => acc + (n.plainText?.split(/\s+/).length || 0), 0);
  const weeklyGoal = 10;
  const weeklyProgress = Math.min(notesThisWeek, weeklyGoal);

  return (
    <ScrollArea className="h-full">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">
            {activeNotes.length} notes · {pendingTasks.length} pending tasks · {totalWords.toLocaleString()} words written
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2"
        >
          <Button onClick={handleNewNote}>
            <Plus className="h-4 w-4" />
            New Note
          </Button>
          <Button variant="outline" onClick={() => setActiveView("tasks")}>
            <CheckSquare className="h-4 w-4" />
            Tasks
          </Button>
          <Button variant="outline" onClick={() => setActiveView("graph")}>
            <GitFork className="h-4 w-4" />
            Graph
          </Button>
          <Button variant="outline" onClick={() => setActiveView("ai")}>
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText className="h-5 w-5 text-primary" />}
            label="Total Notes"
            value={activeNotes.length}
            change={notesThisWeek > 0 ? `+${notesThisWeek} this week` : undefined}
            color="bg-primary/10"
          />
          <StatCard
            icon={<PenTool className="h-5 w-5 text-blue-500" />}
            label="Words Written"
            value={totalWords.toLocaleString()}
            change={wordsThisWeek > 0 ? `+${wordsThisWeek.toLocaleString()} this week` : undefined}
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<CheckSquare className="h-5 w-5 text-emerald-500" />}
            label="Tasks Done"
            value={completedTasks.length}
            change={`${pendingTasks.length} remaining`}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<GitFork className="h-5 w-5 text-purple-500" />}
            label="Connections"
            value={totalBacklinks}
            change={totalBacklinks > 0 ? "Knowledge links" : "No links yet"}
            color="bg-purple-500/10"
          />
        </div>

        {/* Main Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Recent Notes */}
          <WidgetCard
            title="Recent Notes"
            icon={<Clock className="h-4 w-4" />}
            className="md:col-span-2"
            action={
              <Button variant="ghost" size="sm" onClick={() => setActiveView("notes")}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <div className="space-y-2">
              {recentNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No notes yet. Create your first note!
                </p>
              ) : (
                recentNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setCurrentNote(note);
                      setCurrentNoteId(note.id);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors text-left"
                  >
                    {note.color && note.color !== "transparent" ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: note.color }}
                      />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{note.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {note.plainText?.slice(0, 80) || "Empty note"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(note.updatedAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </WidgetCard>

          {/* Tasks */}
          <WidgetCard
            title="Today's Tasks"
            icon={<CheckSquare className="h-4 w-4" />}
            action={
              <Button variant="ghost" size="sm" onClick={() => setActiveView("tasks")}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <div className="space-y-2">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  All caught up! No pending tasks.
                </p>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-full border-2 shrink-0",
                        task.status === "done"
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-muted-foreground/30"
                      )}
                    />
                    <span className={cn(
                      "text-sm flex-1 truncate",
                      task.status === "done" && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </span>
                    {task.priority !== "none" && (
                      <Badge
                        variant={task.priority === "urgent" ? "destructive" : task.priority === "high" ? "warning" : "secondary"}
                        className="text-[10px]"
                      >
                        {task.priority}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </WidgetCard>

          {/* Favorites */}
          <WidgetCard
            title="Favorites"
            icon={<Star className="h-4 w-4" />}
          >
            <div className="space-y-2">
              {favoriteNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Star your favorite notes for quick access.
                </p>
              ) : (
                favoriteNotes.slice(0, 5).map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      setCurrentNote(note);
                      setCurrentNoteId(note.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-accent/50 transition-colors text-left"
                  >
                    <Star className="h-3.5 w-3.5 text-yellow-500 shrink-0" fill="currentColor" />
                    <span className="text-sm truncate">{note.title || "Untitled"}</span>
                  </button>
                ))
              )}
            </div>
          </WidgetCard>

          {/* Quick Capture */}
          <WidgetCard
            title="Quick Capture"
            icon={<Zap className="h-4 w-4" />}
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Quickly jot down an idea or thought.
              </p>
              <Button onClick={handleNewNote} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Quick Note
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveView("daily")}>
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Daily Note
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveView("canvas")}>
                  <Layers className="h-3.5 w-3.5 mr-1" />
                  Canvas
                </Button>
              </div>
            </div>
          </WidgetCard>

          {/* AI Suggestions */}
          <WidgetCard
            title="AI Assistant"
            icon={<Sparkles className="h-4 w-4" />}
            action={
              <Badge variant="info" className="text-[10px]">
                Beta
              </Badge>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Let AI help you organize, summarize, and connect your knowledge.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveView("ai")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Open AI Assistant
              </Button>
              <div className="space-y-1.5">
                {["Summarize recent notes", "Suggest connections", "Daily review"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setActiveView("ai")}
                    className="flex w-full items-center gap-2 rounded-md p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </WidgetCard>

          {/* Knowledge Growth */}
          <WidgetCard
            title="Knowledge Growth"
            icon={<TrendingUp className="h-4 w-4" />}
            className="md:col-span-2 lg:col-span-1"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold">{activeNotes.length}</p>
                  <p className="text-xs text-muted-foreground">Total Notes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(activeNotes.flatMap((n) => n.tags.map((t) => t.name))).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Unique Tags</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Weekly Goal</span>
                  <span className="font-medium">{weeklyProgress}/{weeklyGoal} notes</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(weeklyProgress / weeklyGoal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </WidgetCard>
        </div>

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
