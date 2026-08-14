"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Star,
  Clock,
  Tag,
  Filter,
  X,
  ArrowRight,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNoteStore, useAppStore, useTagStore } from "@/stores";
import { cn, formatDate, calculateReadingTime } from "@/lib/utils";
import type { Note } from "@/types";

type SortOption = "relevance" | "date" | "title";
type FilterOption = "all" | "favorites" | "recent" | "archived";

export function SearchView() {
  const notes = useNoteStore((s) => s.notes);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const tags = useTagStore((s) => s.tags);

  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("relevance");
  const [filterBy, setFilterBy] = React.useState<FilterOption>("all");
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = React.useMemo(() => {
    let filtered = notes.filter((n) => !n.isDeleted);

    if (filterBy === "favorites") filtered = filtered.filter((n) => n.isFavorite);
    if (filterBy === "archived") filtered = filtered.filter((n) => n.isArchived);
    if (filterBy === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((n) => new Date(n.updatedAt) > weekAgo);
    }

    if (selectedTag) {
      filtered = filtered.filter((n) => n.tags.some((t) => t.name === selectedTag));
    }

    if (query.trim()) {
      const lower = query.toLowerCase();
      const terms = lower.split(/\s+/).filter(Boolean);
      filtered = filtered.filter((n) => {
        const searchText = `${n.title} ${n.plainText || ""}`.toLowerCase();
        return terms.every((term) => searchText.includes(term));
      });
    }

    if (sortBy === "relevance" && query.trim()) {
      const lower = query.toLowerCase();
      filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(lower) ? 10 : 0;
        const bTitle = b.title.toLowerCase().includes(lower) ? 10 : 0;
        const aText = (a.plainText || "").toLowerCase().includes(lower) ? 5 : 0;
        const bText = (b.plainText || "").toLowerCase().includes(lower) ? 5 : 0;
        const aExact = a.title.toLowerCase() === lower ? 20 : 0;
        const bExact = b.title.toLowerCase() === lower ? 20 : 0;
        return (bTitle + bText + bExact) - (aTitle + aText + aExact);
      });
    } else if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [notes, query, sortBy, filterBy, selectedTag]);

  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-primary/20 rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  const totalWords = results.reduce((acc, n) => acc + (n.plainText?.split(/\s+/).length || 0), 0);

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Search</h1>
          <p className="text-sm text-muted-foreground">
            Find notes, tasks, and content across your knowledge base
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes by title or content..."
              className="w-full h-12 pl-12 pr-12 rounded-lg border border-border bg-card text-base outline-none focus:ring-2 focus:ring-primary/40 transition-shadow placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(["all", "favorites", "recent", "archived"] as FilterOption[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterBy(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                  filterBy === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            {(["relevance", "date", "title"] as SortOption[]).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                  sortBy === s
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {selectedTag && (
            <Badge variant="secondary" className="gap-1">
              <Hash className="h-3 w-3" />
              {selectedTag}
              <button onClick={() => setSelectedTag(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </motion.div>

        {/* Tags */}
        {tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-1.5"
          >
            {tags.slice(0, 12).map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors",
                  selectedTag === tag.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/50 text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Hash className="h-3 w-3" />
                {tag.name}
              </button>
            ))}
          </motion.div>
        )}

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between text-xs text-muted-foreground"
        >
          <span>
            {results.length} {results.length === 1 ? "result" : "results"}
            {query && ` for "${query}"`}
            {totalWords > 0 && ` · ${totalWords.toLocaleString()} words`}
          </span>
        </motion.div>

        {/* Results */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {results.map((note) => (
              <motion.button
                key={note.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onClick={() => {
                  setCurrentNote(note);
                  setCurrentNoteId(note.id);
                }}
                className="flex w-full items-start gap-4 rounded-md border border-border bg-card p-3 hover:bg-accent/50 hover:border-border/80 transition-all text-left group"
              >
                {note.color && note.color !== "transparent" ? (
                  <span
                    className="h-3 w-3 mt-1 shrink-0 rounded-full"
                    style={{ backgroundColor: note.color }}
                  />
                ) : (
                  <FileText className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">
                      {highlightMatch(note.title || "Untitled", query)}
                    </h3>
                    {note.isFavorite && <Star className="h-3 w-3 text-yellow-500 shrink-0" fill="currentColor" />}
                    {note.isPinned && (
                      <svg className="h-3 w-3 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                      </svg>
                    )}
                  </div>
                  {note.plainText && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {highlightMatch(note.plainText.slice(0, 200), query)}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(note.updatedAt)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {calculateReadingTime(note.plainText || "")} min read
                    </span>
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-[10px]">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
              </motion.button>
            ))}
          </AnimatePresence>

          {results.length === 0 && query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-semibold mb-1">No results found</h3>
              <p className="text-sm text-muted-foreground">
                Try different keywords or adjust your filters
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
