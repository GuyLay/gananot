"use client";

import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <main
        className="flex-1 overflow-auto"
        style={{ paddingBottom: "calc(3.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
