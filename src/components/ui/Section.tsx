import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

/** Full-width header band used at the top of each report section. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-zinc-200 bg-surface-subtle px-6 py-4 sm:px-9',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="mt-0.5 text-base font-bold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

/** Numbered heading (`01. Title`) used for cards inside a section. */
export function NumberedTitle({
  index,
  children,
  className,
}: {
  index: number | string;
  children: ReactNode;
  className?: string;
}) {
  const label = typeof index === 'number' ? String(index).padStart(2, '0') : index;
  return (
    <h3 className={cn('text-sm font-bold text-ink tabular-nums', className)}>
      <span className="mr-1.5 font-mono text-brand-700">{label}.</span>
      {children}
    </h3>
  );
}

/** Small label + value pair. */
export function Field({
  label,
  children,
  labelClassName,
}: {
  label: ReactNode;
  children: ReactNode;
  labelClassName?: string;
}) {
  return (
    <div>
      <div className={cn('mb-1 text-xs font-semibold text-zinc-500', labelClassName)}>{label}</div>
      {children}
    </div>
  );
}
