"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Palette,
  Type,
  Keyboard,
  Bell,
  Shield,
  Database,
  Puzzle,
  Code,
  Monitor,
  Moon,
  Sun,
  Contrast,
  Check,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores";
import { useNoteStore } from "@/stores";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" />, description: "Easy on the eyes" },
  { value: "light", label: "Light", icon: <Sun className="h-4 w-4" />, description: "Bright and clean" },
  { value: "oled", label: "OLED Black", icon: <Contrast className="h-4 w-4" />, description: "True black for OLED" },
  { value: "system", label: "System", icon: <Monitor className="h-4 w-4" />, description: "Match your OS" },
];

const accentColors = [
  { name: "Violet", value: "263 70% 50%", color: "bg-violet-600" },
  { name: "Blue", value: "217 91% 60%", color: "bg-blue-600" },
  { name: "Cyan", value: "189 94% 43%", color: "bg-cyan-600" },
  { name: "Green", value: "142 71% 45%", color: "bg-green-600" },
  { name: "Yellow", value: "48 96% 53%", color: "bg-yellow-500" },
  { name: "Orange", value: "25 95% 53%", color: "bg-orange-500" },
  { name: "Red", value: "0 84% 60%", color: "bg-red-600" },
  { name: "Pink", value: "330 81% 60%", color: "bg-pink-600" },
];

const settingsSections = [
  { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
  { id: "editor", label: "Editor", icon: <Type className="h-4 w-4" /> },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: <Keyboard className="h-4 w-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  { id: "storage", label: "Storage", icon: <Database className="h-4 w-4" /> },
  { id: "plugins", label: "Plugins", icon: <Puzzle className="h-4 w-4" /> },
  { id: "api", label: "API & Developer", icon: <Code className="h-4 w-4" /> },
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

export function SettingsView() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const [activeSection, setActiveSection] = React.useState("appearance");

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
              <div className="rounded-xl border border-border bg-card/30 p-6 space-y-8">
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
                      <SettingRow
                        label="Reduced Motion"
                        description="Minimize animations"
                      >
                        <button
                          role="switch"
                          aria-checked={settings.reducedMotion}
                          aria-label="Reduced Motion"
                          onClick={() => setSettings({ reducedMotion: !settings.reducedMotion })}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            settings.reducedMotion ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                              settings.reducedMotion ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "editor" && (
                  <>
                    <SettingsSection title="Editor Settings">
                      <SettingRow label="Auto Save" description="Automatically save changes">
                        <button
                          role="switch"
                          aria-checked={settings.autoSave}
                          aria-label="Auto Save"
                          onClick={() => setSettings({ autoSave: !settings.autoSave })}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            settings.autoSave ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                              settings.autoSave ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </SettingRow>
                      <SettingRow label="Spell Check" description="Enable browser spell check">
                        <button
                          role="switch"
                          aria-checked={settings.spellCheck}
                          aria-label="Spell Check"
                          onClick={() => setSettings({ spellCheck: !settings.spellCheck })}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            settings.spellCheck ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                              settings.spellCheck ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </SettingRow>
                      <SettingRow label="Show Line Numbers" description="Display line numbers in editor">
                        <button
                          role="switch"
                          aria-checked={settings.showLineNumber}
                          aria-label="Show Line Numbers"
                          onClick={() => setSettings({ showLineNumber: !settings.showLineNumber })}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            settings.showLineNumber ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                              settings.showLineNumber ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </SettingRow>
                      <SettingRow label="Markdown Shortcuts" description="Use markdown shortcuts in editor">
                        <button
                          role="switch"
                          aria-checked={settings.markdownShortcuts}
                          aria-label="Markdown Shortcuts"
                          onClick={() => setSettings({ markdownShortcuts: !settings.markdownShortcuts })}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            settings.markdownShortcuts ? "bg-primary" : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                              settings.markdownShortcuts ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "shortcuts" && (
                  <SettingsSection title="Keyboard Shortcuts">
                    <div className="space-y-2">
                      {[
                        { label: "Command Palette", shortcut: "Ctrl+K" },
                        { label: "New Note", shortcut: "Ctrl+N" },
                        { label: "Search", shortcut: "Ctrl+Shift+F" },
                        { label: "Toggle Sidebar", shortcut: "Ctrl+\\" },
                        { label: "Save", shortcut: "Ctrl+S" },
                        { label: "Zen Mode", shortcut: "Ctrl+Shift+Z" },
                        { label: "Daily Note", shortcut: "Ctrl+D" },
                        { label: "Graph View", shortcut: "Ctrl+G" },
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

                {activeSection === "notifications" && (
                  <>
                    <SettingsSection title="Notifications">
                      <SettingRow label="Email Notifications" description="Receive email alerts for tasks">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Email Notifications"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Desktop Notifications" description="Browser push notifications">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Desktop Notifications"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Task Reminders" description="Remind you of upcoming due dates">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Task Reminders"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Daily Digest" description="Summary of your daily activity">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Daily Digest"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "security" && (
                  <>
                    <SettingsSection title="Security">
                      <SettingRow label="Two-Factor Authentication" description="Extra layer of account security">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Two-Factor Authentication"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Biometric Lock" description="Require fingerprint or face to open app">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Biometric Lock"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Auto-Lock" description="Lock app after inactivity">
                        <div className="flex items-center gap-2">
                          <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                            <option value="5">5 minutes</option>
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="never">Never</option>
                          </select>
                        </div>
                      </SettingRow>
                      <SettingRow label="Encryption" description="Encrypt local data at rest">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Encryption"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "storage" && (
                  <>
                    <SettingsSection title="Storage">
                      <SettingRow label="Local Storage Used" description={`${((typeof window !== 'undefined' ? localStorage.length * 1024 : 0) / 1024 / 1024).toFixed(2)} MB of 50 MB`}>
                        <div className="w-32">
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: "12%" }} />
                          </div>
                        </div>
                      </SettingRow>
                      <SettingRow label="Offline Storage" description="Cache notes for offline access">
                        <button
                          role="switch"
                          aria-checked={true}
                          aria-label="Offline Storage"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-primary"
                        >
                          <span className="absolute top-0.5 left-[22px] h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Auto Backup" description="Backup data daily to cloud">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Auto Backup"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                      <SettingRow label="Export Data" description="Download all notes as JSON">
                        <button
                          onClick={() => {
                            const notes = useNoteStore.getState().notes;
                            const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = "neuronotes-export.json";
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
                        >
                          Export
                        </button>
                      </SettingRow>
                      <SettingRow label="Clear All Data" description="Delete all notes and settings (irreversible)">
                        <button
                          onClick={() => {
                            if (confirm("Are you sure? This will delete ALL your notes and cannot be undone.")) {
                              localStorage.clear();
                              window.location.reload();
                            }
                          }}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/20"
                        >
                          Clear Data
                        </button>
                      </SettingRow>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "plugins" && (
                  <>
                    <SettingsSection title="Plugins">
                      <div className="space-y-3">
                        {[
                          { name: "Markdown Export", description: "Export notes to .md files", enabled: true },
                          { name: "LaTeX Math", description: "Render math equations with KaTeX", enabled: false },
                          { name: "Mermaid Diagrams", description: "Create flowcharts and diagrams", enabled: false },
                          { name: "Web Clipper", description: "Save web pages as notes", enabled: false },
                          { name: "AI Writing Assistant", description: "AI-powered writing suggestions", enabled: false },
                        ].map((plugin) => (
                          <div key={plugin.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-medium">{plugin.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{plugin.description}</p>
                            </div>
                            <button
                              role="switch"
                              aria-checked={plugin.enabled}
                              aria-label={plugin.name}
                              onClick={() => {}}
                              className={cn(
                                "relative h-6 w-11 rounded-full transition-colors",
                                plugin.enabled ? "bg-primary" : "bg-muted"
                              )}
                            >
                              <span
                                className={cn(
                                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                                  plugin.enabled ? "left-[22px]" : "left-0.5"
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </SettingsSection>
                  </>
                )}

                {activeSection === "api" && (
                  <>
                    <SettingsSection title="API & Developer">
                      <SettingRow label="API Key" description="Your personal API key for integrations">
                        <div className="flex items-center gap-2">
                          <code className="rounded border border-border bg-muted px-2 py-1 text-xs font-mono select-all">
                            nnote_sk_••••••••••••••••
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("nnote_sk_demo_key_placeholder");
                            }}
                            className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-accent"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => {}}
                            className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-accent text-red-500"
                          >
                            Regenerate
                          </button>
                        </div>
                      </SettingRow>
                      <SettingRow label="Webhook URL" description="Endpoint for real-time events">
                        <input
                          type="url"
                          placeholder="https://your-app.com/webhook"
                          className="w-64 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                        />
                      </SettingRow>
                      <SettingRow label="Rate Limiting" description="API requests per minute">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={60}
                            min={10}
                            max={1000}
                            className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-center"
                          />
                          <span className="text-xs text-muted-foreground">req/min</span>
                        </div>
                      </SettingRow>
                      <SettingRow label="Debug Mode" description="Enable verbose logging for development">
                        <button
                          role="switch"
                          aria-checked={false}
                          aria-label="Debug Mode"
                          onClick={() => {}}
                          className="relative h-6 w-11 rounded-full transition-colors bg-muted"
                        >
                          <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
                        </button>
                      </SettingRow>
                    </SettingsSection>
                  </>
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
