"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoteStore, useAppStore, useWorkspaceStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";
import type { Note } from "@/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export function CalendarView() {
  const notes = useNoteStore((s) => s.notes);
  const addNote = useNoteStore((s) => s.addNote);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);

  const notesByDate = React.useMemo(() => {
    const map: Record<string, Note[]> = {};
    activeNotes.forEach((note) => {
      const created = new Date(note.createdAt);
      // Never crash on stale/corrupt dates — treat them as untracked.
      if (Number.isNaN(created.getTime())) return;
      const dateStr = created.toISOString().split("T")[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(note);
    });
    return map;
  }, [activeNotes]);

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedDateNotes = notesByDate[selectedDateStr] || [];

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };

  const handleNewNote = () => {
    const now = new Date(selectedDate);
    now.setHours(new Date().getHours(), new Date().getMinutes());
    const iso = now.toISOString();
    const note: Note = {
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
      createdAt: iso,
      updatedAt: iso,
    };
    addNote(note);
    setCurrentNote(note);
    setCurrentNoteId(note.id);
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <ScrollArea className="h-full">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight mb-6">Calendar</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;

                  const date = new Date(currentYear, currentMonth, day);
                  const dateStr = date.toISOString().split("T")[0];
                  const dayNotes = notesByDate[dateStr] || [];
                  const isToday = isSameDay(date, today);
                  const isSelected = isSameDay(date, selectedDate);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "relative flex flex-col items-center p-2 rounded-lg transition-colors min-h-[72px]",
                        isSelected
                          ? "bg-primary/10 ring-1 ring-primary"
                          : "hover:bg-accent/50",
                        isToday && !isSelected && "bg-accent/30"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isToday && "text-primary font-bold",
                          isSelected && "text-primary"
                        )}
                      >
                        {day}
                      </span>
                      {dayNotes.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayNotes.slice(0, 3).map((n) => (
                            <span
                              key={n.id}
                              className="h-1.5 w-1.5 rounded-full bg-primary"
                            />
                          ))}
                          {dayNotes.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">
                              +{dayNotes.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Selected Date Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedDateNotes.length} {selectedDateNotes.length === 1 ? "note" : "notes"}
                  </p>
                </div>
                <Button size="sm" onClick={handleNewNote}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  New
                </Button>
              </div>

              <div className="space-y-2">
                {selectedDateNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No notes on this day</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={handleNewNote}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Create Note
                    </Button>
                  </div>
                ) : (
                  selectedDateNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => {
                        setCurrentNote(note);
                        setCurrentNoteId(note.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors text-left"
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
                          {note.plainText?.slice(0, 60) || "Empty note"}
                        </p>
                      </div>
                      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    </button>
                  ))
                )}
              </div>

              {/* Upcoming */}
              {selectedDateNotes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    {selectedDateNotes.reduce((acc, n) => acc + (n.plainText?.split(/\s+/).length || 0), 0).toLocaleString()} total words
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
