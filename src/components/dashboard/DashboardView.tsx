"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Star,
  Clock,
  CheckSquare,
  Plus,
  ArrowRight,
  GitFork,
  StickyNote,
  Hash,
  Layers,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoteStore, useTaskStore, useAppStore, useWorkspaceStore } from "@/stores";
import { cn, formatDate, generateId } from "@/lib/utils";
import { openDailyNote } from "@/lib/dailyNote";
import { ActivityHeatmap } from "./ActivityHeatmap";

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
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
      className={cn("surface rounded-lg p-4", className)}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="text-[13px] font-semibold">{title}</h3>
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
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <motion.div {...fadeIn} className="surface rounded-lg p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold leading-tight tabular-nums">{value}</p>
          <p className="truncate text-[11px] text-muted-foreground">{label}</p>
        </div>
      </div>
      {hint && <p className="mt-1.5 text-[11px] text-muted-foreground/80">{hint}</p>}
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

  const activeNotes = React.useMemo(
    () => notes.filter((n) => !n.isDeleted && !n.isArchived),
    [notes]
  );
  const favoriteNotes = activeNotes.filter((n) => n.isFavorite);
  const recentNotes = [...activeNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");

  const today = new Date();
  const greeting =
    today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

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

  const totalWords = activeNotes.reduce((acc, n) => acc + (n.plainText?.split(/\s+/).filter(Boolean).length || 0), 0);
  const totalBacklinks = activeNotes.reduce((acc, n) => acc + n.backlinks.length, 0);

  // Top tags across active notes.
  const topTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    activeNotes.forEach((n) => n.tags.forEach((t) => counts.set(t.name, (counts.get(t.name) || 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [activeNotes]);

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-6xl space-y-4 p-5">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-0.5"
        >
          <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-[13px] text-muted-foreground">
            {activeNotes.length} notes · {pendingTasks.length} pending tasks · {totalWords.toLocaleString()} words
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-2"
        >
          <Button size="sm" onClick={handleNewNote}>
            <Plus className="h-3.5 w-3.5" />
            New Note
          </Button>
          <Button variant="outline" size="sm" onClick={() => { openDailyNote(); setActiveView("notes"); }}>
            <StickyNote className="h-3.5 w-3.5" />
            Daily Note
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveView("tasks")}>
            <CheckSquare className="h-3.5 w-3.5" />
            Tasks
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveView("graph")}>
            <GitFork className="h-3.5 w-3.5" />
            Graph
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Total Notes"
            value={activeNotes.length}
            hint={activeNotes.length > 0 ? "Across all folders" : undefined}
          />
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Words Written"
            value={totalWords.toLocaleString()}
            hint={totalWords > 0 ? `${Math.round(totalWords / Math.max(1, activeNotes.length))} avg / note` : undefined}
          />
          <StatCard
            icon={<CheckSquare className="h-4 w-4" />}
            label="Tasks Done"
            value={completedTasks.length}
            hint={`${pendingTasks.length} remaining`}
          />
          <StatCard
            icon={<GitFork className="h-4 w-4" />}
            label="Connections"
            value={totalBacklinks}
            hint={totalBacklinks > 0 ? "via wiki-links" : "Use [[links]] to connect"}
          />
        </div>

        {/* Main Widgets */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Notes */}
          <WidgetCard
            title="Recent Notes"
            icon={<Clock className="h-4 w-4" />}
            className="md:col-span-2"
            action={
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setActiveView("notes")}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <div className="space-y-1">
              {recentNotes.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
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
                    className="group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent/60 transition-colors"
                  >
                    {note.color && note.color !== "transparent" ? (
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: note.color }} />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{note.title || "Untitled"}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {note.plainText?.slice(0, 70) || "Empty note"}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {formatDate(note.updatedAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </WidgetCard>

          {/* Today's Tasks */}
          <WidgetCard
            title="Tasks"
            icon={<CheckSquare className="h-4 w-4" />}
            action={
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setActiveView("tasks")}>
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            }
          >
            <div className="space-y-1">
              {pendingTasks.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-muted-foreground">
                  All caught up! No pending tasks.
                </p>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/40 transition-colors">
                    <div
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 rounded-full border-2",
                        task.status === "done" ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
                      )}
                    />
                    <span className={cn("flex-1 truncate text-[13px]", task.status === "done" && "line-through text-muted-foreground")}>
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

          {/* Activity Heatmap */}
          <WidgetCard
            title="Activity — last 12 months"
            icon={<TrendingUp className="h-4 w-4" />}
            className="lg:col-span-3"
          >
            <ActivityHeatmap notes={activeNotes} />
          </WidgetCard>

          {/* Top Tags */}
          <WidgetCard title="Top Tags" icon={<Hash className="h-4 w-4" />}>
            <div className="space-y-1.5">
              {topTags.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-muted-foreground">
                  Add tags to your notes to see them here.
                </p>
              ) : (
                topTags.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-2">
                    <Hash className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-[13px]">{name}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{count}</span>
                  </div>
                ))
              )}
            </div>
          </WidgetCard>

          {/* Favorites + Quick Capture */}
          <WidgetCard title="Favorites" icon={<Star className="h-4 w-4" />}>
            <div className="space-y-1">
              {favoriteNotes.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-muted-foreground">
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
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent/60 transition-colors"
                  >
                    <Star className="h-3 w-3 shrink-0 text-yellow-500" fill="currentColor" />
                    <span className="truncate text-[13px]">{note.title || "Untitled"}</span>
                  </button>
                ))
              )}
            </div>
          </WidgetCard>

          <WidgetCard title="Quick Capture" icon={<Layers className="h-4 w-4" />}>
            <div className="space-y-2">
              <Button onClick={handleNewNote} className="w-full" variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Quick Note
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => { openDailyNote(); setActiveView("notes"); }}>
                <StickyNote className="h-3.5 w-3.5 mr-1" />
                Today&apos;s Daily Note
              </Button>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setActiveView("canvas")}>
                <Layers className="h-3.5 w-3.5 mr-1" />
                Open Canvas
              </Button>
            </div>
          </WidgetCard>
        </div>

        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
