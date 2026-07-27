"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

function Tooltip({ content, shortcut, children, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setVisible(true), 400);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div
          className={cn(
            "absolute z-50 pointer-events-none animate-in fade-in-0 zoom-in-95",
            "rounded-md bg-popover border border-border px-3 py-1.5 text-xs text-popover-foreground shadow-md",
            "whitespace-nowrap",
            positionClasses[side],
            className
          )}
        >
          <span>{content}</span>
          {shortcut && (
            <span className="ml-2 text-muted-foreground font-mono text-[10px]">
              {shortcut}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
