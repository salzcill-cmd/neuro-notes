"use client";

import { useEffect, useCallback, useRef } from "react";

interface KeyBinding {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: (e: KeyboardEvent) => void;
  description: string;
  category: string;
  preventDefault?: boolean;
}

export function useKeyboard(bindings: KeyBinding[], deps: unknown[] = []) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      for (const binding of bindingsRef.current) {
        const keyMatch = e.key.toLowerCase() === binding.key.toLowerCase();
        const ctrlMatch = binding.ctrlKey ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = binding.metaKey ? e.metaKey : !e.metaKey;
        const shiftMatch = binding.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatch = binding.altKey ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (binding.preventDefault !== false) {
            e.preventDefault();
          }
          binding.action(e);
          return;
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, deps);
}

export function useKeyCombo(
  keys: string[],
  action: () => void,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean }
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const allPressed = keys.every(
        (key) => e.key.toLowerCase() === key.toLowerCase()
      );
      const ctrlMatch = options?.ctrl ? e.ctrlKey : true;
      const metaMatch = options?.meta ? e.metaKey : true;
      const shiftMatch = options?.shift ? e.shiftKey : true;

      if (allPressed && ctrlMatch && metaMatch && shiftMatch) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keys, action, options]);
}

export function useHotkey(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        (!options?.ctrl || e.ctrlKey) &&
        (!options?.meta || e.metaKey) &&
        (!options?.shift || e.shiftKey) &&
        (!options?.alt || e.altKey)
      ) {
        e.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, options?.ctrl, options?.meta, options?.shift, options?.alt]);
}
