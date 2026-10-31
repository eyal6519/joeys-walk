import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

import { cx, inputClass } from './ui';

type FieldShell = { label: string; hint?: string; error?: string | null };

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: FieldShell & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(' ');
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cx(inputClass, error && 'border-danger', className)}
        {...props}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  hint,
  error,
  ...props
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        className={cx(inputClass, 'py-2', error && 'border-danger')}
        {...props}
      />
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type Option<T extends string> = { value: T; label: string; icon?: ReactNode };

/** Accessible single-choice group: native radios, so arrow keys and screen readers just work. */
export function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  onChange,
  options,
  error,
}: {
  legend: string;
  name: string;
  value: T | null;
  onChange: (value: T) => void;
  options: readonly Option<T>[];
  error?: string | null;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={cx(
                'flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface-raised px-4',
                'transition peer-checked:border-brand-strong peer-checked:bg-brand-soft',
                'peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
                'peer-focus-visible:outline-brand-strong',
              )}
            >
              {option.icon ? <span aria-hidden="true">{option.icon}</span> : null}
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
