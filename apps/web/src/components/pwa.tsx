'use client';

import { useEffect, useState } from 'react';

import { Button, Card } from './ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Registers the service worker in production and surfaces the browser's
 * "add to home screen" prompt. The worker is skipped in development so a
 * stale cache never shadows `next dev`.
 */
export function Pwa() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (!installEvent || dismissed) return null;

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => undefined);
    setInstallEvent(null);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center px-4">
      <Card className="pointer-events-auto flex w-full max-w-md items-center gap-3 shadow-lg">
        <span aria-hidden="true" className="text-2xl">
          🐩
        </span>
        <p className="flex-1 text-sm">
          Add Joey&rsquo;s Log to your home screen for quick offline logging.
        </p>
        <Button className="min-h-9 px-3 text-sm" onClick={() => void install()}>
          Install
        </Button>
        <Button
          variant="ghost"
          className="min-h-9 px-2 text-sm"
          onClick={() => setDismissed(true)}
        >
          Not now
        </Button>
      </Card>
    </div>
  );
}
