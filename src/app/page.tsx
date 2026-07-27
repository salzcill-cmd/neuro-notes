"use client";

import dynamic from "next/dynamic";

const AppLayout = dynamic(
  () => import("@/components/layout/AppLayout").then((mod) => ({ default: mod.AppLayout })),
  { ssr: false }
);

const MainContent = dynamic(
  () => import("@/components/layout/MainContent").then((mod) => ({ default: mod.MainContent })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <AppLayout>
      <MainContent />
    </AppLayout>
  );
}
