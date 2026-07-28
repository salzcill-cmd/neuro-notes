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
import { CalendarView } from "@/components/calendar/CalendarView";
import { SearchView } from "@/components/search/SearchView";

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
    case "archive":
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
