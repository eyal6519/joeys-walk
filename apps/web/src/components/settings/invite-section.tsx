'use client';

import { useState } from 'react';

import { createInvite } from '@/lib/data/household';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

import { Button, Card, ErrorNote, inputClass } from '../ui';

export function InviteSection() {
  const { household, actor } = useHousehold();
  const toast = useToast();

  const [link, setLink] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const invite = await createInvite(actor, household);
      setLink(`${window.location.origin}/join?code=${encodeURIComponent(invite.code)}`);
      setExpiresAt(invite.expiresAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create an invite. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      toast('Could not copy. Select the link and copy it manually.', 'error');
    }
  }

  async function share() {
    if (!link) return;
    if (navigator.share) {
      await navigator
        .share({ title: `Join ${household.dogName}'s log`, url: link })
        .catch(() => {});
      return;
    }
    await copy();
  }

  return (
    <section aria-labelledby="invite-heading" className="flex flex-col gap-3">
      <h2 id="invite-heading" className="text-sm font-semibold uppercase tracking-wide">
        Invite someone
      </h2>
      <Card className="flex flex-col gap-3">
        <p className="text-sm text-ink-muted">
          Share a link so someone can help look after {household.dogName}. Links expire
          after 7 days.
        </p>
        {error ? <ErrorNote>{error}</ErrorNote> : null}
        {link ? (
          <div className="flex flex-col gap-2">
            <input
              aria-label="Invite link"
              className={inputClass}
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
            />
            {expiresAt ? (
              <p className="text-xs text-ink-muted">
                Expires {expiresAt.toLocaleString()}.
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={() => void copy()}>
                {copied ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant="secondary" onClick={() => void share()}>
                Share
              </Button>
              <Button variant="ghost" disabled={busy} onClick={() => void generate()}>
                New link
              </Button>
            </div>
          </div>
        ) : (
          <Button disabled={busy} className="self-start" onClick={() => void generate()}>
            {busy ? 'Creating…' : 'Create invite link'}
          </Button>
        )}
      </Card>
    </section>
  );
}
