"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Note } from "@/types";

const WEEKS = 53;
const DAYS = 7;

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function levelFor(count: number): string {
  if (count <= 0) return "bg-muted/70";
  if (count === 1) return "bg-primary/30";
  if (count === 2) return "bg-primary/50";
  if (count === 3) return "bg-primary/70";
  return "bg-primary";
}

/**
 * GitHub-style contribution heatmap: one cell per day over the last
 * ~53 weeks, colored by how many notes were touched that day.
 */
export function ActivityHeatmap({ notes }: { notes: Note[] }) {
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; label: string } | null>(null);

  const { grid, monthLabels, stats } = React.useMemo(() => {
    const today = startOfDay(new Date());

    // Window starts on a Sunday, 53 weeks back (371 cells).
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * DAYS - 1));
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

    const end = new Date(today);
    end.setDate(end.getDate() + 1);

    const counts = new Map<string, number>();
    const keyOf = (d: Date) => d.toISOString().slice(0, 10);
    for (const note of notes) {
      const day = startOfDay(new Date(note.updatedAt));
      if (day >= start && day < end) {
        const k = keyOf(day);
        counts.set(k, (counts.get(k) || 0) + 1);
      }
    }

    const grid: { date: Date; count: number }[][] = [];
    const monthLabels: { index: number; label: string }[] = [];
    let prevMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const week: { date: Date; count: number }[] = [];
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * DAYS + d);
        week.push({ date, count: counts.get(keyOf(date)) || 0 });
      }
      grid.push(week);

      const monday = new Date(week[0].date);
      monday.setDate(monday.getDate() + 1); // first column is Sunday
      const month = monday.getMonth();
      if (month !== prevMonth) {
        prevMonth = month;
        monthLabels.push({ index: w, label: monday.toLocaleDateString("en-US", { month: "short" }) });
      }
    }

    // Active days + streaks within the window.
    const cells = grid.flat().filter((c) => c.date <= today);
    const activeDays = cells.filter((c) => c.count > 0).length;
    const bestStreak = computeBestStreak(cells);
    let currentStreak = 0;
    const ordered = [...cells].reverse();
    for (const c of ordered) {
      if (c.count > 0) currentStreak++;
      else if (c.date.getTime() === today.getTime()) continue;
      else break;
    }

    return {
      grid,
      monthLabels,
      stats: { activeDays, bestStreak, currentStreak },
    };
  }, [notes]);

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>, date: Date, count: number) => {
    const label = `${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} — ${count} ${count === 1 ? "note" : "notes"}`;
    setTooltip({ x: e.clientX, y: e.clientY, label });
  };

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground tabular-nums">{stats.activeDays}</span> active days
        </span>
        <span>
          <span className="font-semibold text-foreground tabular-nums">{stats.currentStreak}</span>{" "}
          {stats.currentStreak === 1 ? "day" : "days"} current streak
        </span>
        <span>
          <span className="font-semibold text-foreground tabular-nums">{stats.bestStreak}</span> best streak
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-block">
          {/* Month labels */}
          <div className="relative h-4 pl-8 text-[10px] text-muted-foreground">
            {monthLabels.map((m) => (
              <span
                key={m.index}
                className="absolute"
                style={{ left: 32 + m.index * 13 }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="mt-1 flex gap-[3px]">
            {/* Day labels */}
            <div className="flex w-8 flex-col gap-[3px] pr-1 text-[9px] text-muted-foreground">
              <span className="h-[10px]">Mon</span>
              <span className="h-[10px]" />
              <span className="h-[10px]">Wed</span>
              <span className="h-[10px]" />
              <span className="h-[10px]">Fri</span>
              <span className="h-[10px]" />
              <span className="h-[10px]">Sun</span>
            </div>

            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    onMouseEnter={(e) => handleEnter(e, cell.date, cell.count)}
                    onMouseLeave={() => setTooltip(null)}
                    className={cn(
                      "h-[10px] w-[10px] rounded-[2px] transition-transform hover:scale-125",
                      levelFor(cell.count)
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Less</span>
        {["bg-muted/70", "bg-primary/30", "bg-primary/50", "bg-primary/70", "bg-primary"].map((cls) => (
          <span key={cls} className={cn("h-[10px] w-[10px] rounded-[2px]", cls)} />
        ))}
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-[80] rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg whitespace-nowrap"
          style={{
            left: Math.min(tooltip.x + 14, window.innerWidth - 220),
            top: Math.min(tooltip.y + 14, window.innerHeight - 40),
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

function computeBestStreak(cells: { date: Date; count: number }[]): number {
  let best = 0;
  let current = 0;
  for (const c of cells) {
    if (c.count > 0) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}
