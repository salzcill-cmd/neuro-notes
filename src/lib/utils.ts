import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Extract Obsidian-style wiki links ([[Note Title]] or [[Note Title|alias]])
 * from plain text. Returns the resolved note titles, aliases stripped.
 */
/**
 * Resolve the note title from a raw `[[...]]` match, stripping any alias
 * (`[[Target|alias]]` → `Target`) and surrounding whitespace.
 */
export function wikiLinkTitleFromMatch(full: string): string {
  return full.slice(2, -2).split("|")[0].trim();
}

export function extractWikiLinks(text: string): string[] {
  const matches = text.match(/\[\[([^\[\]|]+)(?:\|[^\[\]]*)?\]\]/g) || [];
  const titles: string[] = [];
  for (const match of matches) {
    const title = wikiLinkTitleFromMatch(match);
    if (title && !titles.includes(title)) {
      titles.push(title);
    }
  }
  return titles;
}

/**
 * Migrate stored editor HTML: wrap any raw `[[Note Title]]` text in
 * `<span data-wikilink="Note Title">` so the editor's wikiLink node can
 * pick it up on load. Skips code/pre/links/script and already-converted
 * spans. Client-side only (uses the DOM).
 */
export function convertWikiLinksToHtml(html: string): string {
  if (typeof document === "undefined" || !html) return html;

  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.nodeValue || "";
    if (!text.includes("[[")) continue;
    if (node.parentElement?.closest("pre,code,a,span,kbd,script,style")) continue;

    const matches = text.matchAll(/(\[\[[^\[\]]+\]\])/g);
    let hasMatch = false;
    const parts: (string | HTMLSpanElement)[] = [];
    let lastIndex = 0;
    for (const m of matches) {
      hasMatch = true;
      if (m.index! > lastIndex) {
        parts.push(text.slice(lastIndex, m.index!));
      }
      const full = m[0];
      const title = wikiLinkTitleFromMatch(full);
      const span = document.createElement("span");
      span.setAttribute("data-wikilink", title);
      span.textContent = full;
      parts.push(span);
      lastIndex = m.index! + full.length;
    }
    if (!hasMatch) continue;
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    const fragment = document.createDocumentFragment();
    for (const part of parts) {
      fragment.appendChild(
        typeof part === "string" ? document.createTextNode(part) : part
      );
    }
    node.parentNode?.replaceChild(fragment, node);
  }

  return tmp.innerHTML;
}
