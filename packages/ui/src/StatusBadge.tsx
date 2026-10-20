import * as React from 'react';
import { cn } from '@mirage/utils';

export type GxPStatusVariant =
  | 'in-spec'
  | 'caution'
  | 'excursion'
  | 'bioglass'
  | 'regulatory'
  | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: GxPStatusVariant;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  code?: string;
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      variant = 'in-spec',
      size = 'sm',
      pulse = false,
      code,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses: Record<GxPStatusVariant, string> = {
      'in-spec':
        'bg-emerald-50/90 text-[#237A26] border-[#35AB38]/35 shadow-sm shadow-[#35AB38]/5',
      caution:
        'bg-amber-50/90 text-[#B45309] border-[#E5A100]/40 shadow-sm shadow-[#E5A100]/5',
      excursion:
        'bg-rose-50/95 text-[#D32F2F] border-[#D32F2F]/40 shadow-sm shadow-[#D32F2F]/10',
      bioglass:
        'bg-sky-50/90 text-[#2878BC] border-[#2878BC]/35 shadow-sm shadow-[#2878BC]/5',
      regulatory:
        'bg-[#023368] text-white border-[#023368] shadow-sm',
      neutral:
        'bg-slate-100 text-slate-700 border-slate-200',
    };

    const dotClasses: Record<GxPStatusVariant, string> = {
      'in-spec': 'bg-[#35AB38]',
      caution: 'bg-[#E5A100]',
      excursion: 'bg-[#D32F2F]',
      bioglass: 'bg-[#2878BC]',
      regulatory: 'bg-[#61C0E4]',
      neutral: 'bg-slate-400',
    };

    const sizeClasses = {
      xs: 'px-2 py-0.5 text-[10px] gap-1',
      sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
      md: 'px-3 py-1 text-xs gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-mono font-bold border tracking-tight select-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {pulse ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotClasses[variant]
              )}
            />
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                dotClasses[variant]
              )}
            />
          </span>
        ) : (
          <span
            className={cn(
              'inline-block h-1.5 w-1.5 rounded-full shrink-0',
              dotClasses[variant]
            )}
          />
        )}

        {code ? (
          <span className="opacity-75 pr-1 border-r border-current/20 uppercase">
            {code}
          </span>
        ) : null}

        <span>{children}</span>
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
