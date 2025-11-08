// src/app/(dashboard)/layout.tsx
"use client";

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  Skeleton
} from "@polarix/ui/components";
import "./../globals.css";

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r bg-background p-4 hidden md:block">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-4/5" />
        </div>
      </aside>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
