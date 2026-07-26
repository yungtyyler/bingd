"use client";

import { CheckCircle2, Download, Share, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallAppSection() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneDisplay());
    setIsIos(isIosDevice());

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    setIsPending(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }

      setInstallPrompt(null);
    } finally {
      setIsPending(false);
    }
  };

  if (isInstalled) {
    return (
      <section className="bg-surface-card border border-brand-primary/30 p-6 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-xl font-bold text-white mb-2">App Installed</h2>
            <p className="text-sm text-gray-400">
              This device is already running bingd as an installed app.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface-card border border-surface-border p-6 rounded-xl shadow-sm">
      <div className="flex items-start gap-3">
        <Smartphone
          className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-white mb-2">Install App</h2>
          <p className="text-sm text-gray-400 mb-5">
            Add bingd to your home screen for faster launch and a native app
            feel.
          </p>

          {installPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={isPending}
              className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isPending ? "Opening..." : "Install bingd"}
            </button>
          ) : isIos ? (
            <div className="rounded-lg border border-surface-border bg-surface-base p-3 text-sm text-gray-300">
              <div className="flex items-center gap-2 font-bold text-white">
                <Share className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                Safari Install
              </div>
              <p className="mt-2 text-gray-400">
                Open bingd in Safari, tap Share, then Add to Home Screen.
              </p>
            </div>
          ) : (
            <p className="rounded-lg border border-surface-border bg-surface-base p-3 text-sm text-gray-400">
              If your browser supports installation, its install option will
              appear here after the page finishes loading.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
