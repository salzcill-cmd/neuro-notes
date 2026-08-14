"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Type,
  Keyboard,
  Database,
  Monitor,
  Moon,
  Sun,
  Contrast,
  Check,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore, useNoteStore } from "@/stores";
import { cn } from "@/lib/utils";
import { htmlToMarkdown } from "@/lib/markdown";
import type { Theme } from "@/types";

const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" />, description: "Easy on the eyes" },
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4" />, description: "Bright and clean" },
  { value: "oled", label: "OLED Black", icon: <Contrast className="h-4 w-4" />, description: "True black for OLED" },
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4" />, description: "Match your OS" },
];

const accentColors = [
  { name: "Blue", value: "217 91% 60%", color: "bg-blue-500" },
  { name: "Sky", value: "199 89% 48%", color: "bg-sky-500" },
  { name: "Cyan", value: "189 94% 43%", color: "bg-cyan-500" },
  { name: "Emerald", value: "160 84% 39%", color: "bg-emerald-500" },
  { name: "Amber", value: "38 92% 50%", color: "bg-amber-500" },
  { name: "Orange", value: "24 95% 53%", color: "bg-orange-500" },
  { name: "Red", value: "0 84% 60%", color: "bg-red-500" },
  { name: "Pink", value: "330 81% 60%", color: "bg-pink-500" },
];

const settingsSections = [
  { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  { id: "editor", label: "Editor", icon: <Type className="h-4 w-4" /> },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: <Keyboard className="h-4 w-4" /> },
  { id: "storage", label: "Storage", icon: <Database className="h-4 w-4" /> },
];

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

function useToggle(initial = false) {
  const [value, setValue] = React.useState(initial);
  const toggle = React.useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
}

export function SettingsView() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const [activeSection, setActiveSection] = React.useState("appearance");

  // Storage settings
  const [offlineStorage, toggleOfflineStorage] = useToggle(true);
  const [autoBackup, toggleAutoBackup] = useToggle(false);

  const handleExport = () => {
    const notes = useNoteStore.getState().notes;
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neuronotes-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const active = useNoteStore
      .getState()
      .notes.filter((n) => !n.isDeleted)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const parts = active.map((n) => `# ${n.title || "Untitled"}\n\n${htmlToMarkdown(n.content || "")}`);
    const blob = new Blob([parts.join("\n\n---\n\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neuronotes-export.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete ALL your notes and cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>

          <div className="flex gap-8">
            {/* Sidebar */}
            <nav className="w-56 shrink-0 space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="surface rounded-lg p-6 space-y-8">
                {activeSection === "appearance" && (
                  <>
                    <SettingsSection title="Theme">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {themes.map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => setSettings({ theme: theme.value })}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                              settings.theme === theme.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-border/80"
                            )}
                          >
                            <span className={cn(
                              settings.theme === theme.value ? "text-primary" : "text-muted-foreground"
                            )}>
                              {theme.icon}
                            </span>
                            <span className="text-sm font-medium">{theme.label}</span>
                            {settings.theme === theme.value && (
                              <Check className="h-3.5 w-3.5 text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </SettingsSection>

                    <Separator />

                    <SettingsSection title="Accent Color">
                      <div className="flex flex-wrap gap-3">
                        {accentColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setSettings({ accentColor: color.value })}
                            className={cn(
                              "h-8 w-8 rounded-full transition-all",
                              color.color,
                              settings.accentColor === color.value
                                ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                                : "hover:scale-110"
                            )}
                          />
                        ))}
                      </div>
                    </SettingsSection>

                    <Separator />

                    <SettingsSection title="Typography">
                      <SettingRow label="Font Size" description={`${settings.fontSize}px`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={12}
                            max={20}
                            value={settings.fontSize}
                            onChange={(e) => setSettings({ fontSize: Number(e.target.value) })}
                            className="w-32"
                          />
                          <span className="text-xs text-muted-foreground w-8">{settings.fontSize}px</span>
                        </div>
                      </SettingRow>
                      <SettingRow label="Line Height" description={`${settings.lineHeight}`}>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={1.25}
                            max={2.5}
                            step={0.25}
                            value={settings.lineHeight}
                            onChange={(e) => setSettings({ lineHeight: Number(e.target.value) })}
                            className="w-32"
                          />
                          <span className="text-xs text-muted-foreground w-8">{settings.lineHeight}</span>
                        </div>
                      </SettingRow>
                    </SettingsSection>

                    <Separator />

                    <SettingsSection title="Accessibility">
                      <SettingRow label="Reduced Motion" description="Minimize animations">
                        <Toggle checked={settings.reducedMotion} onToggle={() => setSettings({ reducedMotion: !settings.reducedMotion })} label="Reduced Motion" />
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "editor" && (
                  <>
                    <SettingsSection title="Editor Settings">
                      <SettingRow label="Default View" description="Which view opens when you open a note">
                        <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
                          {(["edit", "split", "preview"] as const).map((v) => (
                            <button
                              key={v}
                              onClick={() => setSettings({ defaultView: v })}
                              className={cn(
                                "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                                settings.defaultView === v
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </SettingRow>
                      <SettingRow label="Auto Save" description="Automatically save changes">
                        <Toggle checked={settings.autoSave} onToggle={() => setSettings({ autoSave: !settings.autoSave })} label="Auto Save" />
                      </SettingRow>
                      <SettingRow label="Spell Check" description="Enable browser spell check">
                        <Toggle checked={settings.spellCheck} onToggle={() => setSettings({ spellCheck: !settings.spellCheck })} label="Spell Check" />
                      </SettingRow>
                      <SettingRow label="Show Line Numbers" description="Display line numbers in editor">
                        <Toggle checked={settings.showLineNumber} onToggle={() => setSettings({ showLineNumber: !settings.showLineNumber })} label="Show Line Numbers" />
                      </SettingRow>
                      <SettingRow label="Markdown Shortcuts" description="Use markdown shortcuts in editor">
                        <Toggle checked={settings.markdownShortcuts} onToggle={() => setSettings({ markdownShortcuts: !settings.markdownShortcuts })} label="Markdown Shortcuts" />
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "shortcuts" && (
                  <SettingsSection title="Keyboard Shortcuts">
                    <div className="space-y-2">
                      {[
                        { label: "Quick Switcher", shortcut: "Ctrl+O" },
                        { label: "Command Palette", shortcut: "Ctrl+K" },
                        { label: "New Note", shortcut: "Ctrl+N" },
                        { label: "Daily Note", shortcut: "Ctrl+D" },
                        { label: "Search", shortcut: "Ctrl+Shift+F" },
                        { label: "Tasks", shortcut: "Ctrl+Shift+T" },
                        { label: "Zen Mode", shortcut: "Ctrl+Shift+Z" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/50">
                          <span className="text-sm">{item.label}</span>
                          <kbd className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-mono">
                            {item.shortcut}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </SettingsSection>
                )}

                {activeSection === "storage" && (
                  <SettingsSection title="Storage">
                    <SettingRow label="Local Storage Used" description={`${((typeof window !== 'undefined' ? localStorage.length * 1024 : 0) / 1024 / 1024).toFixed(2)} MB of 50 MB`}>
                      <div className="w-32">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: "12%" }} />
                        </div>
                      </div>
                    </SettingRow>
                    <SettingRow label="Offline Storage" description="Cache notes for offline access">
                      <Toggle checked={offlineStorage} onToggle={toggleOfflineStorage} label="Offline Storage" />
                    </SettingRow>
                    <SettingRow label="Auto Backup" description="Backup data daily to cloud">
                      <Toggle checked={autoBackup} onToggle={toggleAutoBackup} label="Auto Backup" />
                    </SettingRow>
                    <SettingRow label="Export Data" description="Download all notes as JSON or Markdown">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExport}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                        >
                          Export JSON
                        </button>
                        <button
                          onClick={handleExportMarkdown}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                        >
                          Export .md
                        </button>
                      </div>
                    </SettingRow>
                    <SettingRow label="Clear All Data" description="Delete all notes and settings (irreversible)">
                      <button
                        onClick={handleClearData}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20"
                      >
                        Clear Data
                      </button>
                    </SettingRow>
                  </SettingsSection>
                )}


              </div>
            </div>
          </div>
        </motion.div>

        <div className="h-6" />
      </div>
    </ScrollArea>
  );
}
