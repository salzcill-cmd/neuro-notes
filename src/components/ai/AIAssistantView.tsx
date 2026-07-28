"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Lightbulb,
  PenTool,
  ListChecks,
  GitFork,
  FileText,
  Bot,
  User,
  Trash2,
  Settings,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNoteStore, useAppStore, useUIStore } from "@/stores";
import { cn, generateId } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const suggestions = [
  { icon: <PenTool className="h-4 w-4" />, label: "Help me write", description: "Generate content for your note" },
  { icon: <BookOpen className="h-4 w-4" />, label: "Summarize", description: "Create a summary of selected text" },
  { icon: <GitFork className="h-4 w-4" />, label: "Find connections", description: "Discover related notes and ideas" },
  { icon: <ListChecks className="h-4 w-4" />, label: "Create action items", description: "Extract tasks from your notes" },
  { icon: <Lightbulb className="h-4 w-4" />, label: "Brainstorm", description: "Generate ideas for your project" },
  { icon: <FileText className="h-4 w-4" />, label: "Improve writing", description: "Enhance clarity and style" },
];

function generateContextualResponse(input: string, notes: ReturnType<typeof useNoteStore.getState>["notes"]): string {
  const lower = input.toLowerCase();
  const activeNotes = notes.filter((n) => !n.isDeleted && !n.isArchived);

  if (lower.includes("summarize") || lower.includes("summary")) {
    if (activeNotes.length === 0) {
      return "I don't see any notes in your workspace yet. Create some notes first, and I'll be able to summarize them for you.\n\nTip: You can use templates to quickly create structured notes.";
    }
    const recentNotes = [...activeNotes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
    const titles = recentNotes.map((n) => `- **${n.title}**`).join("\n");
    return `Here's a summary of your 5 most recent notes:\n\n${titles}\n\n**Overview:** You have ${activeNotes.length} notes in your workspace. Your most actively edited notes are focused on ${recentNotes[0]?.title || "various topics"}. ${recentNotes.length > 1 ? `You've also been working on "${recentNotes[1]?.title}".` : ""}\n\nWould you like me to dive deeper into any of these notes?`;
  }

  if (lower.includes("connection") || lower.includes("related") || lower.includes("link")) {
    const tagged = activeNotes.filter((n) => n.tags.length > 0);
    const tagMap = new Map<string, string[]>();
    tagged.forEach((n) => {
      n.tags.forEach((t) => {
        const existing = tagMap.get(t.name) || [];
        existing.push(n.title);
        tagMap.set(t.name, existing);
      });
    });
    if (tagMap.size === 0) {
      return "I don't see any tags or connections between your notes yet. To help find connections:\n\n1. Add tags to your notes (e.g., #research, #project)\n2. Use backlinks between related notes\n3. Organize notes into folders\n\nOnce you have some structure, I can discover meaningful connections for you.";
    }
    const connections = Array.from(tagMap.entries())
      .filter(([, titles]) => titles.length > 1)
      .map(([tag, titles]) => `- **${tag}**: ${titles.join(", ")}`)
      .slice(0, 5)
      .join("\n");
    return connections
      ? `I found ${tagMap.size} tags across your notes. Here are notes connected by shared tags:\n\n${connections}\n\nThese notes share common themes. Would you like me to suggest how to organize or link them further?`
      : `You have ${tagMap.size} unique tags, but no notes share the same tag yet. Try adding common tags like #research or #project to related notes to build connections.`;
  }

  if (lower.includes("write") || lower.includes("content") || lower.includes("draft")) {
    const titles = activeNotes.slice(0, 5).map((n) => n.title);
    return `I'd love to help you write! Based on your existing notes, here are some ideas:\n\n1. **Continue a note** — Pick one of your recent notes and I can help expand it:\n   ${titles.map((t) => `• ${t}`).join("\n   ")}\n\n2. **Create a new note** — I can help you outline and draft a brand new note on any topic.\n\n3. **Connect ideas** — I can weave together themes from multiple notes into a cohesive piece.\n\nWhat would you like to focus on?`;
  }

  if (lower.includes("brainstorm") || lower.includes("idea")) {
    const recentTopics = activeNotes.slice(0, 3).map((n) => n.title);
    const topics = recentTopics.length > 0 ? `Based on your recent work on "${recentTopics.join('", "')}"` : "Based on your workspace";
    return `${topics}, here are some ideas to explore:\n\n1. **Deep dive** — Take one concept and explore it in depth\n2. **Cross-pollination** — Connect two unrelated ideas from your notes\n3. **Implementation** — Turn an abstract idea into concrete action items\n4. **Teaching** — Write an explanation as if teaching someone else\n5. **Opposite approach** — Challenge your current thinking by arguing the other side\n\nWhich direction interests you? I can help develop any of these further.`;
  }

  if (lower.includes("task") || lower.includes("action") || lower.includes("todo")) {
    return `Here's how I can help with task management:\n\n1. **Extract tasks** from any note — share a note's content and I'll pull out action items\n2. **Prioritize** — I can help you rank tasks by urgency and importance\n3. **Break down** — Turn large tasks into smaller, manageable subtasks\n4. **Schedule** — Suggest a timeline based on task complexity\n\nWant to paste some text and have me extract the action items?`;
  }

  if (lower.includes("improve") || lower.includes("edit") || lower.includes("better")) {
    return `I can help improve your writing in several ways:\n\n- **Clarity** — Simplify complex sentences\n- **Structure** — Reorganize for better flow\n- **Conciseness** — Remove unnecessary words\n- **Tone** — Adjust for your audience\n- **Grammar** — Fix errors and inconsistencies\n\nPaste the text you'd like me to review, or point me to a specific note.`;
  }

  const noteCount = activeNotes.length;
  const tagCount = new Set(activeNotes.flatMap((n) => n.tags.map((t) => t.name))).size;

  return `I understand you're asking about "${input.slice(0, 50)}${input.length > 50 ? "..." : ""}".\n\nHere's what I know about your workspace:\n- **${noteCount}** notes total\n- **${tagCount}** unique tags\n- **${activeNotes.filter((n) => n.isFavorite).length}** favorited notes\n\nI can help you with:\n- **Writing** — Draft, edit, and improve content\n- **Organization** — Tags, folders, and backlinks\n- **Analysis** — Find patterns and connections\n- **Planning** — Break ideas into actionable tasks\n\nWhat would you like to work on?`;
}

function MessageBubble({
  message,
  onCopy,
  onFeedback,
}: {
  message: Message;
  onCopy: (content: string) => void;
  onFeedback: (id: string, type: "up" | "down") => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(type);
    onFeedback(message.id, type);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className="max-w-[70%] group">
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted border border-border"
          )}
        >
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
          <div
            className={cn(
              "mt-2 text-[10px]",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Copy message"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
            <button
              onClick={() => handleFeedback("up")}
              className={cn(
                "p-1 rounded-md hover:bg-accent/50 transition-colors",
                feedback === "up" ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Good response"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleFeedback("down")}
              className={cn(
                "p-1 rounded-md hover:bg-accent/50 transition-colors",
                feedback === "down" ? "text-red-500" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Bad response"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </motion.div>
  );
}

export function AIAssistantView() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you write, summarize, brainstorm, find connections between notes, and much more.\n\nI have access to your workspace and can provide contextual suggestions. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const notes = useNoteStore((s) => s.notes);
  const showToast = useUIStore((s) => s.showToast);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    const delay = 400 + Math.min(input.length * 10, 1200);
    setTimeout(() => {
      const content = generateContextualResponse(input, notes);
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, delay);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(`Help me with: ${suggestion}`);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast("Copied to clipboard", "success");
  };

  const handleFeedback = (messageId: string, type: "up" | "down") => {
    showToast(type === "up" ? "Thanks for the feedback!" : "Sorry about that. I'll do better.", "success");
  };

  const handleClearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "Chat cleared. How can I help you?",
      timestamp: new Date().toISOString(),
    }]);
  };

  return (
    <div className="flex h-full">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Context-aware · {notes.filter((n) => !n.isDeleted).length} notes loaded
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="info" className="text-[10px]">
              {notes.filter((n) => !n.isDeleted).length} notes in context
            </Badge>
            {messages.length > 1 && (
              <Button variant="ghost" size="icon-sm" onClick={handleClearChat} aria-label="Clear chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={handleCopy}
                  onFeedback={handleFeedback}
                />
              ))}
            </AnimatePresence>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-xl bg-muted border border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border px-6 py-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask AI anything..."
                  className="min-h-[44px] resize-none pr-12"
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                size="icon"
                className="h-[44px] w-[44px] shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              AI responses are generated based on your workspace context. Always verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions Sidebar */}
      <div className="w-72 border-l border-border bg-background/50 hidden lg:block">
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-semibold">Quick Actions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => handleSuggestion(suggestion.label)}
                className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left hover:bg-accent/50 transition-colors"
              >
                <span className="shrink-0 text-primary">{suggestion.icon}</span>
                <div>
                  <p className="text-sm font-medium">{suggestion.label}</p>
                  <p className="text-[11px] text-muted-foreground">{suggestion.description}</p>
                </div>
              </button>
            ))}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold mb-2">Tips</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Ask me to summarize any of your notes</p>
              <p>• I can find connections between notes with shared tags</p>
              <p>• Paste text and ask me to improve it</p>
              <p>• Ask me to extract action items from meeting notes</p>
              <p>• I can help brainstorm based on your existing work</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
