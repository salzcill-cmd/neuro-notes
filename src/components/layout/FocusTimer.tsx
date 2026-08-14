"use client";

import * as React from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

const PRESETS = [15, 25, 45, 60];

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Pomodoro-style focus timer shown in the status bar. Runs in memory —
 * no persistence, just a gentle nudge to stay in flow.
 */
export function FocusTimer() {
  const showToast = useUIStore((s) => s.showToast);
  const [durationMin, setDurationMin] = React.useState(25);
  const [remainingMs, setRemainingMs] = React.useState(25 * 60_000);
  const [running, setRunning] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const finishTimer = React.useCallback(() => {
    setRunning(false);
    setOpen(false);
    setRemainingMs(durationMin * 60_000);
    showToast("Focus session complete — nice work!", "success");
  }, [durationMin, showToast]);

  const doneRef = React.useRef(false);

  React.useEffect(() => {
    if (!running) return;
    doneRef.current = false;
    const id = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          if (!doneRef.current) {
            doneRef.current = true;
            setTimeout(finishTimer, 0);
          }
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, finishTimer]);

  const start = () => setRunning(true);
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setRemainingMs(durationMin * 60_000);
  };
  const setPreset = (min: number) => {
    setDurationMin(min);
    setRemainingMs(min * 60_000);
    setRunning(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
          running ? "text-primary" : "hover:bg-accent hover:text-foreground",
          open && "bg-accent text-foreground"
        )}
        aria-label="Focus timer"
        aria-expanded={open}
      >
        <Timer className="h-3 w-3" />
        <span className="tabular-nums">{formatTime(remainingMs)}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-7 right-0 z-50 w-60 rounded-lg border border-border bg-popover p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Focus Timer
              </p>
              <span className={cn("h-2 w-2 rounded-full", running ? "animate-pulse bg-primary" : "bg-muted")} />
            </div>

            <div className="mb-3 flex gap-1">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={cn(
                    "flex-1 rounded-md border border-border px-1 py-1 text-[11px] font-medium transition-colors",
                    durationMin === p
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {p}m
                </button>
              ))}
            </div>

            <p className="mb-3 text-center text-2xl font-bold tabular-nums tracking-tight">
              {formatTime(remainingMs)}
            </p>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={running ? pause : start}>
                {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {running ? "Pause" : "Start"}
              </Button>
              <Button size="sm" variant="outline" onClick={reset} aria-label="Reset timer">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
