"use client";

import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  onLongPress: (e: React.MouseEvent | React.TouchEvent) => void;
  onClick?: (e: React.MouseEvent | React.TouchEvent) => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
}: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay]
  );

  const stop = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (!isLongPress.current && onClick) {
        onClick(e);
      }
    },
    [onClick]
  );

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}
