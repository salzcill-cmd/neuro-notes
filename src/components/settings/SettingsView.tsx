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

                {!["appearance", "editor", "shortcuts"].includes(activeSection) && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      {settingsSections.find((s) => s.id === activeSection)?.icon && (
                        <span className="h-8 w-8 text-muted-foreground/50 flex items-center justify-center">
                          {settingsSections.find((s) => s.id === activeSection)!.icon}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">
                      {settingsSections.find((s) => s.id === activeSection)?.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Coming soon
                    </p>
                  </div>
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
