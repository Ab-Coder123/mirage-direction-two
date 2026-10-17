import * as React from 'react';
import { cn } from '@mirage/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'obsidian' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', children, ...props }, ref) => {
    const base = 'rounded-2xl transition-all duration-300 relative';

    const variants = {
      glass: 'hud-glass shadow-hud-glass border border-white/80',
      solid: 'bg-white border border-[#E2E8F0] shadow-sm',
      obsidian: 'bg-[#020F24] border border-white/10 text-white shadow-xl',
      interactive:
        'hud-glass shadow-hud-glass border border-white/80 hover:shadow-hud-glow hover:border-[#2878BC]/40 hover:-translate-y-1 cursor-pointer',
    };

    return (
      <div ref={ref} className={cn(base, variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
