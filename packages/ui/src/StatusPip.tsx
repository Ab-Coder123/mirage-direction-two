import * as React from 'react';
import { cn } from '@mirage/utils';

export interface StatusPipProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: 'optimal' | 'warning' | 'critical' | 'nominal';
  label?: string;
  showPing?: boolean;
}

export const StatusPip: React.FC<StatusPipProps> = ({
  status = 'optimal',
  label,
  showPing = true,
  className,
  ...props
}) => {
  const statusColors = {
    optimal: {
      ping: 'bg-emerald-400',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
    },
    nominal: {
      ping: 'bg-emerald-400',
      dot: 'bg-emerald-500',
      text: 'text-emerald-700',
    },
    warning: {
      ping: 'bg-amber-400',
      dot: 'bg-amber-500',
      text: 'text-amber-700',
    },
    critical: {
      ping: 'bg-rose-400',
      dot: 'bg-rose-500',
      text: 'text-rose-700',
    },
  };

  const current = statusColors[status];

  return (
    <span
      className={cn('inline-flex items-center gap-2 font-mono text-xs', className)}
      role="status"
      aria-label={label ?? `System status: ${status}`}
      {...props}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {showPing && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              current.ping
            )}
          />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.dot)} />
      </span>
      {label && <span className={cn('font-medium', current.text)}>{label}</span>}
    </span>
  );
};
