'use client';

import { useState, type FormEvent } from 'react';

import { placeInputSchema, type Place } from '@walklogger/shared';

import { addPlace, deletePlace, reorderPlaces, updatePlace } from '@/lib/data/places';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

import { ChevronDownIcon, ChevronUpIcon, PinIcon } from '../icons';
import { Button, Card, EmptyState, ErrorNote, inputClass, SectionHeading } from '../ui';

type Draft = { label: string };

const EMPTY: Draft = { label: '' };

function PlaceRow({
  place,
  first,
  last,
  onMove,
  onEdit,
}: {
  place: Place;
  first: boolean;
  last: boolean;
  onMove: (dir: -1 | 1) => void;
  onEdit: () => void;
}) {
  return (
    <li className="flex items-center gap-2 border-t border-line py-2.5 first:border-t-0">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-[0.6rem] bg-surface-sunken text-ink-muted"
      >
        <PinIcon size={18} />
      </span>
      <span className="flex-1 truncate font-semibold">{place.label}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          aria-label={`Move ${place.label} up`}
          disabled={first}
          className="min-h-9 px-2"
          onClick={() => onMove(-1)}
        >
          <ChevronUpIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          aria-label={`Move ${place.label} down`}
          disabled={last}
          className="min-h-9 px-2"
          onClick={() => onMove(1)}
        >
          <ChevronDownIcon size={18} />
        </Button>
        <Button variant="ghost" className="min-h-9 px-3 text-sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </li>
  );
}

export function PlacesSection() {
  const { household, places } = useHousehold();
  const toast = useToast();

  const active = places.filter((p) => !p.archived);
  const archived = places.filter((p) => p.archived);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const nextOrder = places.reduce((max, p) => Math.max(max, p.order), -1) + 1;

  function move(place: Place, dir: -1 | 1) {
    const index = active.findIndex((p) => p.id === place.id);
    const target = index + dir;
    if (index < 0 || target < 0 || target >= active.length) return;
    const ids = active.map((p) => p.id);
    [ids[index], ids[target]] = [ids[target] as string, ids[index] as string];
    reorderPlaces(household.id, ids).catch((e: Error) =>
      toast(`Could not reorder: ${e.message}`, 'error'),
    );
  }

  function add(event: FormEvent) {
    event.preventDefault();
    const parsed = placeInputSchema.safeParse({ label: draft.label, icon: null });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the details');
      return;
    }
    setError(null);
    addPlace(household.id, parsed.data, nextOrder).catch((e: Error) =>
      toast(`Could not add the place: ${e.message}`, 'error'),
    );
    setDraft(EMPTY);
    setAdding(false);
  }

  function startEdit(place: Place) {
    setEditingId(place.id);
    setEditDraft({ label: place.label });
    setError(null);
  }

  function saveEdit(event: FormEvent, place: Place) {
    event.preventDefault();
    const parsed = placeInputSchema.safeParse({ label: editDraft.label, icon: null });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the details');
      return;
    }
    setError(null);
    updatePlace(household.id, place.id, {
      label: parsed.data.label,
      icon: parsed.data.icon,
    }).catch((e: Error) => toast(`Could not save: ${e.message}`, 'error'));
    setEditingId(null);
  }

  function setArchived(place: Place, value: boolean) {
    updatePlace(household.id, place.id, { archived: value }).catch((e: Error) =>
      toast(`Could not update: ${e.message}`, 'error'),
    );
  }

  function remove(place: Place) {
    if (!window.confirm(`Delete “${place.label}”? Past entries keep their label.`))
      return;
    deletePlace(household.id, place.id).catch((e: Error) =>
      toast(`Could not delete: ${e.message}`, 'error'),
    );
  }

  return (
    <section aria-labelledby="places-heading" className="flex flex-col gap-3">
      <SectionHeading
        id="places-heading"
        action={
          !adding && (
            <Button
              variant="ghost"
              className="min-h-9 px-3 text-sm"
              onClick={() => setAdding(true)}
            >
              Add
            </Button>
          )
        }
      >
        Places at home
      </SectionHeading>

      <Card className="flex flex-col gap-3">
        {error ? <ErrorNote>{error}</ErrorNote> : null}

        {adding && (
          <form
            onSubmit={add}
            className="flex flex-col gap-2.5 rounded-control border border-line p-3"
          >
            <input
              aria-label="Place name"
              className={inputClass}
              placeholder="e.g. Balcony"
              maxLength={40}
              autoFocus
              value={draft.label}
              onChange={(e) => setDraft({ label: e.target.value })}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Add place
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setAdding(false);
                  setDraft(EMPTY);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {active.length === 0 ? (
          <EmptyState
            title="No places yet"
            hint="Add where Joey usually has accidents."
          />
        ) : (
          <ul className="flex flex-col">
            {active.map((place, i) =>
              editingId === place.id ? (
                <li key={place.id} className="border-t border-line first:border-t-0">
                  <form
                    onSubmit={(e) => saveEdit(e, place)}
                    className="flex flex-col gap-2.5 py-3"
                  >
                    <input
                      aria-label="Place name"
                      className={inputClass}
                      maxLength={40}
                      value={editDraft.label}
                      onChange={(e) => setEditDraft({ label: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Save
                      </Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                    <button
                      type="button"
                      className="self-start text-sm font-semibold text-danger underline"
                      onClick={() => {
                        setArchived(place, true);
                        setEditingId(null);
                      }}
                    >
                      Archive instead
                    </button>
                  </form>
                </li>
              ) : (
                <PlaceRow
                  key={place.id}
                  place={place}
                  first={i === 0}
                  last={i === active.length - 1}
                  onMove={(dir) => move(place, dir)}
                  onEdit={() => startEdit(place)}
                />
              ),
            )}
          </ul>
        )}
      </Card>

      {archived.length > 0 && (
        <Card className="flex flex-col gap-2">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            Archived
          </h3>
          <ul className="flex flex-col">
            {archived.map((place) => (
              <li
                key={place.id}
                className="flex items-center gap-2 border-t border-line py-2.5 first:border-t-0"
              >
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-[0.6rem] bg-surface-sunken text-ink-muted opacity-60"
                >
                  <PinIcon size={18} />
                </span>
                <span className="flex-1 truncate font-medium text-ink-muted">
                  {place.label}
                </span>
                <Button
                  variant="ghost"
                  className="min-h-9 px-3 text-sm"
                  onClick={() => setArchived(place, false)}
                >
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  className="min-h-9 px-3 text-sm text-danger"
                  onClick={() => remove(place)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
