import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-strong text-on-brand shadow-card hover:brightness-110',
  secondary: 'border border-line-strong bg-surface-raised text-ink hover:bg-brand-soft',
  danger: 'bg-danger text-white hover:brightness-110',
  ghost: 'text-ink-soft hover:bg-brand-soft hover:text-ink',
};

export function buttonClass(variant: Variant = 'primary', extra?: string): string {
  return cx(
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-control px-5 font-semibold',
    'transition-[transform,filter,background-color] duration-150 active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-45',
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
  'min-h-12 w-full rounded-control border border-line-strong bg-surface-raised px-4 text-ink ' +
  'placeholder:text-ink-muted focus-visible:border-brand-strong focus-visible:outline-2 ' +
  'focus-visible:outline-offset-1 focus-visible:outline-brand-strong';

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'rounded-card border border-line bg-surface-raised p-5 shadow-card',
        className,
      )}
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
        className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-brand-strong"
      />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm font-medium text-danger">
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
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[26px] font-extrabold leading-tight">{title}</h1>
        {subtitle ? (
          <p className="text-sm font-medium text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

/** A section heading with the space above it that separates it from the last. */
export function SectionHeading({
  children,
  action,
  id,
}: {
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2
        id={id}
        className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted"
      >
        {children}
      </h2>
      {action}
    </div>
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
    <div className="flex flex-col items-center gap-1.5 rounded-card border border-dashed border-line-strong px-8 py-10 text-center">
      <p className="font-bold">{title}</p>
      {hint ? <p className="max-w-xs text-sm text-ink-muted">{hint}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

const TILE_TONE: Record<string, string> = {
  brand: 'text-brand-strong bg-brand-soft',
  live: 'text-live bg-[color-mix(in_oklab,var(--color-live)_14%,transparent)]',
  poop: 'text-poop bg-[color-mix(in_oklab,var(--color-poop)_14%,transparent)]',
};

/**
 * A large, thumb-sized row for one primary thing the user can do. Renders an
 * anchor when given `href`, a button when given `onClick`.
 */
export function ActionTile({
  href,
  onClick,
  icon: Icon,
  title,
  subtitle,
  tone = 'brand',
  className,
}: {
  href?: string;
  onClick?: () => void;
  icon: (props: { size?: number }) => ReactNode;
  title: string;
  subtitle?: string;
  tone?: 'brand' | 'live' | 'poop';
  className?: string;
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cx(
          'grid size-11 shrink-0 place-items-center rounded-[0.8rem]',
          TILE_TONE[tone],
        )}
      >
        <Icon size={22} />
      </span>
      <span className="flex flex-col text-left">
        <span className="text-[15px] font-bold leading-tight">{title}</span>
        {subtitle ? (
          <span className="text-[12.5px] font-medium text-ink-muted">{subtitle}</span>
        ) : null}
      </span>
    </>
  );
  const classes = cx(
    'flex min-h-[68px] w-full items-center gap-3.5 rounded-control border border-line bg-surface-raised p-3',
    'text-ink shadow-card transition-[border-color,transform] duration-150 active:scale-[0.99]',
    'hover:border-line-strong',
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {body}
    </button>
  );
}

/**
 * A two-or-more-way control for a mutually exclusive choice. Renders as a
 * single segmented track so the options read as one decision, not stacked
 * buttons. Built on native pressed buttons for keyboard and screen readers.
 */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(
        'grid gap-1 rounded-control border border-line bg-surface-sunken p-1',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'flex min-h-11 items-center justify-center gap-2 rounded-[0.6rem] px-3 text-sm font-semibold',
              'transition-colors duration-150',
              active
                ? 'bg-surface-raised text-ink shadow-card'
                : 'text-ink-muted hover:text-ink-soft',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
