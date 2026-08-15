"use client";

import * as React from "react";

/**
 * Next.js error boundary — shown when a client-side crash happens so the
 * user gets a clear message with a reload action instead of a blank page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Report to console for debugging; keeps the UI clean.
    console.error("App crashed:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background px-6 text-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        NeuroNotes hit an unexpected error. Your notes are safe — try reloading,
        or clear the app data if the problem persists.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reload
        </button>
        <button
          onClick={() => {
            try {
              localStorage.clear();
              window.location.reload();
            } catch {
              window.location.reload();
            }
          }}
          className="inline-flex h-8 items-center justify-center rounded-md border border-border px-4 text-[13px] font-medium transition-colors hover:bg-accent"
        >
          Clear app data &amp; reload
        </button>
      </div>
    </div>
  );
}
