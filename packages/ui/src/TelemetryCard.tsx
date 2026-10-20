import * as React from 'react';
import { cn } from '@mirage/utils';

export interface TelemetryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  targetSpec?: string;
  status?: 'optimal' | 'warning' | 'critical' | 'nominal';
  sparkline?: number[];
  icon?: React.ReactNode;
}

export const TelemetryCard = React.forwardRef<HTMLDivElement, TelemetryCardProps>(
  (
    {
      className,
      label,
      value,
      subtitle,
      delta,
      targetSpec,
      status = 'optimal',
      sparkline,
      icon,
      ...props
    },
    ref
  ) => {
    const gradientId = React.useId();

    const statusColors = {
      optimal: 'text-[#237A26] bg-emerald-50/90 border-[#35AB38]/35',
      warning: 'text-[#B45309] bg-amber-50/90 border-[#E5A100]/40',
      critical: 'text-[#D32F2F] bg-rose-50/90 border-[#D32F2F]/40',
      nominal: 'text-[#2878BC] bg-sky-50/90 border-[#2878BC]/35',
    };

    const dotColors = {
      optimal: 'bg-[#35AB38]',
      warning: 'bg-[#E5A100]',
      critical: 'bg-[#D32F2F]',
      nominal: 'bg-[#2878BC]',
    };

    const strokeColors = {
      optimal: '#35AB38',
      warning: '#E5A100',
      critical: '#D32F2F',
      nominal: '#2878BC',
    };

    const renderSparkline = () => {
      if (!sparkline || sparkline.length < 2) return null;
      const min = Math.min(...sparkline);
      const max = Math.max(...sparkline);
      const range = max - min || 1;
      const width = 124;
      const height = 34;

      const coords = sparkline.map((val, idx) => {
        const x = (idx / (sparkline.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 8) - 4;
        return { x, y };
      });

      const points = coords
        .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
        .join(' ');

      const areaPath = `M 0,${height} L ${coords
        .map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`)
        .join(' L ')} L ${width},${height} Z`;

      const lastCoord = coords[coords.length - 1];

      return (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible shrink-0"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={strokeColors[status]}
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor={strokeColors[status]}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <polyline
            fill="none"
            stroke={strokeColors[status]}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {lastCoord ? (
            <circle
              cx={lastCoord.x}
              cy={lastCoord.y}
              r="3"
              fill={strokeColors[status]}
            />
          ) : null}
        </svg>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'hud-glass rounded-3xl p-5 border border-white/80 shadow-hud-glass transition-all duration-300 hover:border-[#2878BC]/40 flex flex-col justify-between gap-3',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={cn(
                  'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                  dotColors[status]
                )}
              />
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2 w-2',
                  dotColors[status]
                )}
              />
            </span>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {label}
            </span>
          </div>
          {icon ? (
            <div className="w-8 h-8 rounded-xl bg-slate-100/90 border border-slate-200/70 flex items-center justify-center text-[#2878BC]">
              {icon}
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-heading font-extrabold text-[#023368] tabular-numbers tracking-tight">
              {value}
            </div>
            {subtitle ? (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {subtitle}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {renderSparkline()}
            {delta ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border',
                  statusColors[status]
                )}
              >
                {delta}
              </span>
            ) : null}
          </div>
        </div>

        {targetSpec ? (
          <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>GxP Target Spec</span>
            <span className="font-bold text-[#023368]">{targetSpec}</span>
          </div>
        ) : null}
      </div>
    );
  }
);

TelemetryCard.displayName = 'TelemetryCard';
