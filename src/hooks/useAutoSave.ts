"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoSaveOptions {
  data: unknown;
  onSave: (data: unknown) => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({
  data,
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedDataRef = useRef(data);
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const save = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const currentData = JSON.stringify(data);
      const lastSavedData = JSON.stringify(savedDataRef.current);
      if (currentData !== lastSavedData) {
        onSaveRef.current(data);
        savedDataRef.current = data;
      }
    }, delay);
  }, [data, delay]);

  useEffect(() => {
    if (enabled) {
      save();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, save]);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const currentData = JSON.stringify(data);
    const lastSavedData = JSON.stringify(savedDataRef.current);
    if (currentData !== lastSavedData) {
      onSaveRef.current(data);
      savedDataRef.current = data;
    }
  }, [data]);

  return { flush };
}
