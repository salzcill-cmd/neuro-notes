"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { NotesView } from "@/components/notes/NotesView";
import { NoteEditorView } from "@/components/notes/NoteEditorView";
import { GraphView } from "@/components/graph/GraphView";
import { TasksView } from "@/components/tasks/TasksView";
import { SettingsView } from "@/components/settings/SettingsView";
import { CanvasView } from "@/components/canvas/CanvasView";
import { DatabaseView } from "@/components/database/DatabaseView";
import { TemplatesView } from "@/components/notes/TemplatesView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { SearchView } from "@/components/search/SearchView";

const editorViews = ["notes", "favorites", "recent", "daily", "trash", "archive"];

export function MainContent() {
  const activeView = useAppStore((s) => s.activeView);
  const currentNoteId = useAppStore((s) => s.currentNoteId);

  let view: React.ReactNode;
  let key: string;

  if (currentNoteId && editorViews.includes(activeView)) {
    key = `note-${currentNoteId}`;
    view = <NoteEditorView />;
  } else {
    key = activeView;
    switch (activeView) {
      case "dashboard":
        view = <DashboardView />;
        break;
      case "notes":
      case "favorites":
      case "recent":
      case "daily":
      case "trash":
      case "archive":
        view = <NotesView />;
        break;
      case "graph":
        view = <GraphView />;
        break;
      case "tasks":
        view = <TasksView />;
        break;
      case "canvas":
        view = <CanvasView />;
        break;
      case "database":
        view = <DatabaseView />;
        break;
      case "templates":
        view = <TemplatesView />;
        break;
      case "calendar":
        view = <CalendarView />;
        break;
      case "search":
        view = <SearchView />;
        break;
      case "settings":
        view = <SettingsView />;
        break;
      default:
        view = <DashboardView />;
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="h-full"
      >
        {view}
      </motion.div>
    </AnimatePresence>
  );
}
