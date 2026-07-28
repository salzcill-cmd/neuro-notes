"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Calendar,
  BookOpen,
  CheckSquare,
  Code,
  PenTool,
  Lightbulb,
  GraduationCap,
  Briefcase,
  Search,
  ArrowRight,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoteStore, useAppStore, useWorkspaceStore, useUIStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";
import type { Note } from "@/types";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  content: string;
  color: string;
}

const defaultTemplates: Template[] = [
  {
    id: "daily",
    name: "Daily Note",
    description: "A daily journal template with mood tracking and reflection",
    icon: <Calendar className="h-5 w-5" />,
    category: "Journal",
    color: "bg-blue-500/10 text-blue-500",
    content: `# Daily Note - {{date}}

## Morning Intentions
- 

## Tasks
- [ ] 

## Notes
<!-- Write your thoughts here -->

## Evening Reflection
### What went well?

### What could be improved?

### Gratitude
- 

## Mood
**Energy:** ⭐⭐⭐⭐⭐
**Focus:** ⭐⭐⭐⭐⭐
`,
  },
  {
    id: "meeting",
    name: "Meeting Notes",
    description: "Structured meeting notes with action items",
    icon: <Briefcase className="h-5 w-5" />,
    category: "Work",
    color: "bg-purple-500/10 text-purple-500",
    content: `# Meeting Notes - {{date}}

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion

### Topic 1


### Topic 2


## Action Items
- [ ] 

## Decisions Made
- 

## Next Steps
- 

## Follow-up Date
`,
  },
  {
    id: "research",
    name: "Research Note",
    description: "Template for academic or project research",
    icon: <BookOpen className="h-5 w-5" />,
    category: "Research",
    color: "bg-green-500/10 text-green-500",
    content: `# Research: {{title}}

## Research Question


## Key Findings
1. 
2. 
3. 

## Sources
- 

## Methodology


## Analysis


## Conclusions


## Related Notes
- 

## Tags
#research 
`,
  },
  {
    id: "project",
    name: "Project Plan",
    description: "Project planning template with milestones",
    icon: <CheckSquare className="h-5 w-5" />,
    category: "Project",
    color: "bg-orange-500/10 text-orange-500",
    content: `# Project: {{title}}

## Overview
**Start Date:** 
**End Date:** 
**Status:** Planning

## Objectives
1. 
2. 
3. 

## Milestones
### Milestone 1 - 
- [ ] 
- [ ] 

### Milestone 2 - 
- [ ] 
- [ ] 

## Resources
- 

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
|      |        |            |

## Progress
**Overall:** 0%

## Notes
`,
  },
  {
    id: "book",
    name: "Book Notes",
    description: "Template for reading notes and summaries",
    icon: <BookOpen className="h-5 w-5" />,
    category: "Learning",
    color: "bg-yellow-500/10 text-yellow-500",
    content: `# Book Notes: {{title}}

**Author:** 
**Rating:** ⭐⭐⭐⭐⭐
**Date Read:** 

## Summary
<!-- Brief summary of the book -->

## Key Takeaways
1. 
2. 
3. 

## Favorite Quotes
> 

## Chapter Notes

### Chapter 1


### Chapter 2


## How This Applies to Me


## Action Items
- [ ] 

## Related Books
- 
`,
  },
  {
    id: "code",
    name: "Code Snippet",
    description: "Template for documenting code snippets",
    icon: <Code className="h-5 w-5" />,
    category: "Development",
    color: "bg-cyan-500/10 text-cyan-500",
    content: `# Code Snippet: {{title}}

## Description


## Language
\`\`\`
// code here
\`\`\`

## Usage


## Parameters
| Param | Type | Description |
|-------|------|-------------|
|       |      |             |

## Returns


## Examples


## Notes
- 

## Related
- 
`,
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    description: "Mind mapping and brainstorming template",
    icon: <Lightbulb className="h-5 w-5" />,
    category: "Thinking",
    color: "bg-pink-500/10 text-pink-500",
    content: `# Brainstorm: {{topic}}

## Central Idea


## Ideas

### Category 1
- 
- 
- 

### Category 2
- 
- 
- 

### Category 3
- 
- 
- 

## Best Ideas
1. 
2. 
3. 

## Next Steps
- 

## Connections
<!-- Link to related notes here -->
`,
  },
  {
    id: "learning",
    name: "Learning Note",
    description: "Structured learning template with spaced repetition",
    icon: <GraduationCap className="h-5 w-5" />,
    category: "Learning",
    color: "bg-indigo-500/10 text-indigo-500",
    content: `# Learning: {{topic}}

## What I Learned
<!-- Main concepts -->

## Key Concepts
1. 
2. 
3. 

## Examples


## Practice Questions
1. Q:
   A:

2. Q:
   A:

## Connections to Prior Knowledge


## Areas to Review
- [ ] 

## Mastery Level
**Self-assessment:** ⭐⭐⭐⭐⭐

## Resources
- 
`,
  },
];

function TemplateCard({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-xl border border-border bg-card/30 p-5 hover:bg-accent/30 hover:border-border/80 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", template.color)}>
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUse(template)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Use Template
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
}

export function TemplatesView() {
  const addNote = useNoteStore((s) => s.addNote);
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const setCurrentNoteId = useAppStore((s) => s.setCurrentNoteId);
  const showToast = useUIStore((s) => s.showToast);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const categories = React.useMemo(() => {
    const cats = new Set(defaultTemplates.map((t) => t.category));
    return Array.from(cats);
  }, []);

  const filteredTemplates = React.useMemo(() => {
    return defaultTemplates.filter((t) => {
      const matchesSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleUseTemplate = (template: Template) => {
    const now = new Date().toISOString();
    const content = template.content.replace("{{date}}", new Date().toLocaleDateString()).replace("{{title}}", "New Note");
    const note: Note = {
      id: generateId(),
      title: template.name,
      content,
      plainText: content,
      folderId: null,
      workspaceId: currentWorkspace?.id || "default",
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      tags: [],
      backlinks: [],
      links: [],
      createdAt: now,
      updatedAt: now,
    };
    addNote(note);
    setCurrentNote(note);
    setCurrentNoteId(note.id);
    showToast(`Created note from "${template.name}" template`, "success");
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredTemplates.length} templates available
            </p>
          </div>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Create Template
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={selectedCategory === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={handleUseTemplate}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No templates found</h3>
            <p className="text-sm text-muted-foreground">Try a different search or category</p>
          </div>
        )}

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
