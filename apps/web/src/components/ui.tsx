import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-strong text-on-brand hover:opacity-90',
  secondary: 'border border-line bg-surface-raised text-ink hover:bg-brand-soft',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'text-ink hover:bg-brand-soft',
};

export function buttonClass(variant: Variant = 'primary', extra?: string): string {
  return cx(
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-medium',
    'transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong',
    VARIANTS[variant],
    extra,
  );
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

export const inputClass =
  'min-h-11 w-full rounded-xl border border-line bg-surface-raised px-3 text-ink ' +
  'placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-1 ' +
  'focus-visible:outline-brand-strong';

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx('rounded-card border border-line bg-surface-raised p-4', className)}
    >
      {children}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 p-10 text-ink-muted"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-line border-t-brand-strong"
      />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-danger">
      {children}
    </p>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-ink-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line p-8 text-center">
      <span aria-hidden="true" className="text-3xl">
        🐾
      </span>
      <p className="font-medium">{title}</p>
      {hint ? <p className="text-sm text-ink-muted">{hint}</p> : null}
      {action}
    </div>
  );
}
