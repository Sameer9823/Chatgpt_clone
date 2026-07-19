"use client";

import { AppSidebar } from "@/features/conversation/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-dvh overflow-hidden overscroll-behavior-contain bg-background">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}