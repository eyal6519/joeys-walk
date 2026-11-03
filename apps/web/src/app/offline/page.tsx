'use client';

import Link from 'next/link';

import { CloudOffIcon } from '@/components/icons';
import { buttonClass } from '@/components/ui';

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-[0.9rem] bg-surface-sunken text-ink-muted"
        >
          <CloudOffIcon size={24} />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">You are offline</h1>
      </div>
      <p className="text-ink-muted">
        Joey&rsquo;s Log needs a connection the first time it opens. Anything you logged
        while offline is saved on this device and will sync automatically once you are
        back.
      </p>
      <Link href="/" className={buttonClass('primary')}>
        Try again
      </Link>
    </main>
  );
}
