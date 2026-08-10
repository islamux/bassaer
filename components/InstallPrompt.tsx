"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(() =>
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setShow(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShow(false);
  };

  if (installed || !show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-slide-up">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A0781E] to-[#6B4F0F] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">ب</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)]">تثبيت التطبيق</p>
          <p className="text-xs text-[var(--muted-foreground)] truncate">تصفح بصائر دون اتصال بالإنترنت</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          تثبيت
        </button>
        <button
          onClick={() => setShow(false)}
          className="p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors flex-shrink-0"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
