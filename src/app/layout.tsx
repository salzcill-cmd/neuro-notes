import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuroNotes — Your Second Brain",
  description: "Local-first knowledge management. Capture thoughts, connect ideas, and build a second brain.",
  keywords: ["notes", "knowledge management", "second brain", "wiki", "PKM", "obsidian", "productivity"],
  authors: [{ name: "NeuroNotes" }],
  creator: "NeuroNotes",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NeuroNotes",
    title: "NeuroNotes — Your Second Brain",
    description: "Local-first knowledge management. Capture, connect, and create.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroNotes — Your Second Brain",
    description: "Local-first knowledge management. Capture, connect, and create.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    other: { rel: "icon", type: "image/svg+xml", url: "/favicon.svg" },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
