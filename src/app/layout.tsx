import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroNotes — Your Second Brain",
  description: "AI-Powered Knowledge Management Platform. Think better, connect ideas, build knowledge.",
  keywords: ["notes", "knowledge management", "second brain", "AI", "productivity", "wiki", "PKM"],
  authors: [{ name: "NeuroNotes" }],
  creator: "NeuroNotes",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NeuroNotes",
    title: "NeuroNotes — Your Second Brain",
    description: "AI-Powered Knowledge Management Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroNotes — Your Second Brain",
    description: "AI-Powered Knowledge Management Platform",
  },
  manifest: "/manifest.json",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
