import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn.ts';

const VARIANTS = {
  primary: 'text-white bg-brand-600 hover:bg-brand-700',
  secondary: 'text-ink bg-white border border-zinc-300 hover:bg-zinc-50',
  soft: 'text-brand-800 bg-brand-50 border border-brand-200 hover:bg-brand-100',
  ghost: 'text-zinc-600 hover:text-ink',
  link: 'text-brand-700 hover:underline',
  inverse: 'text-brand-50 bg-night-700 border border-night-500 hover:bg-night-600',
} as const;

const SIZES = {
  xs: 'gap-1 px-2.5 py-1 text-xs',
  sm: 'gap-1.5 px-3.5 py-2 text-xs',
  md: 'gap-2 px-5 py-2.5 text-sm',
} as const;

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export function Button({
  variant = 'primary',
  size = 'sm',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-sm font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        variant !== 'link' && variant !== 'ghost' && SIZES[size],
        (variant === 'link' || variant === 'ghost') && 'gap-1 text-xs',
        className,
      )}
      {...props}
    />
  );
}

export interface IconButtonProps extends ComponentProps<'button'> {
  /** Accessible label; also shown as a tooltip. */
  label: string;
  tone?: 'neutral' | 'danger';
}

export function IconButton({ label, tone = 'neutral', className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'shrink-0 rounded-sm p-1.5 text-zinc-400 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600',
        tone === 'danger' ? 'hover:bg-red-50 hover:text-red-700' : 'hover:bg-brand-50 hover:text-brand-700',
        className,
      )}
      {...props}
    />
  );
}
