"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { useUIStore } from "@/store/ui-store";

export function AppWindow({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebar = useUIStore((s) => s.setSidebar);

  return (
    <div className="h-screen bg-[#F5F7FA] dark:bg-[#1a1f2e] transition-colors overflow-hidden">
      <div className="h-full flex flex-col">
        <TopHeader />
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setSidebar(false)}
              aria-hidden
            />
          )}
          <main className="flex-1 min-w-0 bg-[#F5F7FA] dark:bg-[#1a1f2e] overflow-y-auto transition-colors scrollbar-thin">
            <div className="p-4 sm:p-6 lg:p-8 h-full">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
