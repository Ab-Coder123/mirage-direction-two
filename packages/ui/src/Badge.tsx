import * as React from 'react';
import { cn } from '@mirage/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'vitality' | 'cyan' | 'outline' | 'glass';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1.5 font-medium rounded-full tracking-wide transition-colors';

  const variants = {
    primary:
      'bg-[#2878BC]/10 text-[#2878BC] border border-[#2878BC]/20 dark:bg-[#2878BC]/20 dark:text-brand-cyan-light dark:border-brand-primary/30',
    secondary:
      'bg-[#023368]/10 text-[#023368] border border-[#023368]/20 dark:bg-white/10 dark:text-white dark:border-white/15',
    vitality:
      'bg-[#35AB38]/10 text-[#35AB38] border border-[#35AB38]/20 dark:bg-[#35AB38]/20 dark:text-emerald-400 dark:border-emerald-500/30',
    cyan:
      'bg-[#308995]/10 text-[#308995] border border-[#308995]/20 dark:bg-[#308995]/20 dark:text-brand-cyan-light dark:border-brand-cyan-light/30',
    outline:
      'border border-[#E2E8F0] text-slate-600 bg-white/60 dark:border-white/15 dark:text-slate-300 dark:bg-[#041B3B]',
    glass:
      'hud-glass text-[#023368] border border-white/80 shadow-sm dark:text-white dark:border-white/10',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
