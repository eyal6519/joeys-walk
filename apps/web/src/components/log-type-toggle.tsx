import type { LogType } from '@walklogger/shared';

import { cx } from './ui';

export function LogTypeToggle({ value, onChange }: { value: LogType; onChange: (type: LogType) => void }) {
  return (
    <div role="group" aria-label="Entry type" className="grid grid-cols-2 gap-2">
      {(['walk', 'home'] as const).map((type) => (
        <button
          key={type}
          type="button"
          aria-pressed={value === type}
          onClick={() => onChange(type)}
          className={cx(
            'min-h-12 rounded-xl border font-medium transition',
            value === type
              ? 'border-brand-strong bg-brand-soft text-brand-strong'
              : 'border-line bg-surface-raised text-ink-muted',
          )}
        >
          {type === 'walk' ? '🦮 Walk' : '🏠 Found at home'}
        </button>
      ))}
    </div>
  );
}
