"use client";

import { ApiProvider } from "@/lib/providers/api-provider";
import { AuthProvider } from "@/lib/providers/auth-provider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ApiProvider>{children}</ApiProvider>
    </AuthProvider>
  );
}
