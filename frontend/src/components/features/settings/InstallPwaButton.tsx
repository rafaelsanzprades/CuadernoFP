"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPwaButton({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) return null;

  if (!isSidebarOpen) {
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center justify-center p-2 rounded-lg text-info hover:bg-info/10 transition-colors"
        title="Instalar app"
      >
        <Download className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Button
      onClick={handleInstallClick}
      className="w-full flex items-center justify-center gap-2 bg-info/10 hover:bg-info/20 text-info border border-info/30 transition-all text-body py-2 mb-2"
    >
      <Download className="w-4 h-4" />
      <span>Instalar App</span>
    </Button>
  );
}
