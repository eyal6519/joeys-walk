'use client';

import { useState, type FormEvent } from 'react';

import { removeMember, renameSelf } from '@/lib/data/household';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

import { PersonIcon } from '../icons';
import { Button, Card, ErrorNote, inputClass, SectionHeading } from '../ui';

export function MembersSection() {
  const { household, members, actor, isOwner } = useHousehold();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(actor.name);
  const [error, setError] = useState<string | null>(null);

  function save(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 80) {
      setError('Enter a name between 1 and 80 characters.');
      return;
    }
    setError(null);
    renameSelf(household.id, actor.uid, trimmed).catch((e: Error) =>
      toast(`Could not rename: ${e.message}`, 'error'),
    );
    setEditing(false);
  }

  function remove(uid: string, displayName: string) {
    if (!window.confirm(`Remove ${displayName} from ${household.name}?`)) return;
    removeMember(household.id, uid).catch((e: Error) =>
      toast(`Could not remove: ${e.message}`, 'error'),
    );
  }

  return (
    <section aria-labelledby="members-heading" className="flex flex-col gap-3">
      <SectionHeading id="members-heading">People</SectionHeading>
      <Card className="flex flex-col gap-3">
        <ul className="flex flex-col">
          {members.map((member) => (
            <li
              key={member.uid}
              className="flex items-center gap-2.5 border-t border-line py-2.5 first:border-t-0"
            >
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-muted"
              >
                <PersonIcon size={18} />
              </span>
              <span className="flex-1 truncate font-semibold">
                {member.displayName}
                {member.uid === actor.uid && (
                  <span className="font-medium text-ink-muted"> (you)</span>
                )}
              </span>
              <span className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                {member.role}
              </span>
              {isOwner && member.uid !== actor.uid && (
                <Button
                  variant="ghost"
                  className="min-h-9 px-3 text-sm text-danger"
                  onClick={() => remove(member.uid, member.displayName)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>

        {editing ? (
          <form onSubmit={save} className="flex flex-col gap-2">
            <input
              aria-label="Your display name"
              className={inputClass}
              maxLength={80}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Save name
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setName(actor.name);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => setEditing(true)}
          >
            Change your name
          </Button>
        )}
      </Card>
    </section>
  );
}
