"use client";

import * as React from "react";
import { useAppStore } from "@/stores";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { NotesView } from "@/components/notes/NotesView";
import { NoteEditorView } from "@/components/notes/NoteEditorView";
import { GraphView } from "@/components/graph/GraphView";
import { TasksView } from "@/components/tasks/TasksView";
import { SettingsView } from "@/components/settings/SettingsView";
import { AIAssistantView } from "@/components/ai/AIAssistantView";
import { CanvasView } from "@/components/canvas/CanvasView";
import { DatabaseView } from "@/components/database/DatabaseView";
import { TemplatesView } from "@/components/notes/TemplatesView";

export function MainContent() {
  const activeView = useAppStore((s) => s.activeView);
  const currentNoteId = useAppStore((s) => s.currentNoteId);

  const editorViews = ["notes", "favorites", "recent", "daily", "trash", "archive"];
  if (currentNoteId && editorViews.includes(activeView)) {
    return <NoteEditorView />;
  }

  switch (activeView) {
    case "dashboard":
      return <DashboardView />;
    case "notes":
    case "favorites":
    case "recent":
    case "daily":
    case "trash":
      return <NotesView />;
    case "graph":
      return <GraphView />;
    case "tasks":
      return <TasksView />;
    case "ai":
      return <AIAssistantView />;
    case "canvas":
      return <CanvasView />;
    case "database":
      return <DatabaseView />;
    case "templates":
      return <TemplatesView />;
    case "calendar":
      return <CalendarView />;
    case "search":
      return <SearchView />;
    case "settings":
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
}

function CalendarView() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📅</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">Calendar</h3>
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}

function SearchView() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold mb-1">Advanced Search</h3>
        <p className="text-sm text-muted-foreground">Use Ctrl+K for quick search</p>
      </div>
    </div>
  );
}
