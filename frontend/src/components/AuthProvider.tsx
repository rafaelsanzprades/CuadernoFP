"use client";
import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // sin sesión de servidor: la web y la app de escritorio son estáticas y no tienen /api/auth/session (devolvía HTML y daba error en consola)
  return <SessionProvider session={null} refetchOnWindowFocus={false} refetchInterval={0}>{children}</SessionProvider>;
}
