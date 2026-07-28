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
  Zap,
  Bot,
  User,
  Trash2,
  Settings,
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

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

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
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-4 py-3 text-sm",
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
      content: "Hello! I'm your AI assistant. I can help you write, summarize, brainstorm, find connections between notes, and much more. How can I help you today?",
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

    // Simulate AI response (in production, this would call an API)
    setTimeout(() => {
      const responses = [
        "I understand you'd like help with that. Here's what I suggest:\n\n1. Start by outlining your main points\n2. Add relevant context from your existing notes\n3. Use backlinks to connect related ideas\n\nWould you like me to help you elaborate on any of these points?",
        "Great question! Based on your recent notes, I can see you've been working on several related topics. Let me help you organize these thoughts into a coherent structure.\n\nHere are some connections I've found:\n- Your note on 'Project Planning' relates to this topic\n- Your 'Research Notes' from last week might provide useful context\n\nShall I create a summary or suggest next steps?",
        "I've analyzed your request and here's what I found:\n\n**Key Insights:**\n- Your writing has been consistently focused on knowledge management\n- You have 12 related notes that could be connected\n- There's a pattern in your recent topics that suggests a deeper theme\n\n**Suggestions:**\n- Consider creating a new folder for this topic\n- I can generate tags to help organize these notes\n- Would you like me to draft an outline?",
      ];

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(`Help me with: ${suggestion}`);
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
                Powered by AI · Context-aware
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="info" className="text-[10px]">
              {notes.length} notes in context
            </Badge>
            <Button variant="ghost" size="icon-sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
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
            <h3 className="text-sm font-semibold mb-2">Recent Conversations</h3>
            <div className="space-y-1">
              {["Writing help", "Research summary", "Brainstorm ideas"].map((conv) => (
                <button
                  key={conv}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  {conv}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
