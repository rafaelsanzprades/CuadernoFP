import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#14a085",
};

export const metadata: Metadata = {
  title: "Cuaderno FP",
  description: "Cuaderno FP para Ciclos Formativos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuaderno FP",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { TourGuide } from "@/components/features/onboarding/TourGuide";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { PageTransition } from "@/components/layout/PageTransition";
import { ChatbotWidget } from "@/components/features/chatbot/ChatbotWidget";
import { DataSourceTheme } from "@/components/layout/DataSourceTheme";
import { I18nProvider } from "@/i18n/I18nProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col transition-colors duration-300">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        <I18nProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
              <DataSourceTheme />
              <GlobalErrorBoundary>
                <PageTransition>
                  {children}
                </PageTransition>
              </GlobalErrorBoundary>
              <TourGuide />
              <ChatbotWidget />
              <Toaster position="bottom-right" toastOptions={{
                style: { background: 'var(--glass-bg)', color: 'var(--foreground)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)' },
                success: { iconTheme: { primary: '#14a085', secondary: '#fff' } },
                ariaProps: {
                  role: 'status',
                  'aria-live': 'polite',
                }
              }} />
            </ThemeProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
