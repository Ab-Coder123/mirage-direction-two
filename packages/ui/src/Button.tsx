import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@mirage/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'vitality';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const baseClasses =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-brand-primary hover:bg-brand-primary-600 text-white shadow-sm focus-visible:ring-brand-primary',
      secondary:
        'bg-brand-navy hover:bg-brand-navy-dark text-white shadow-sm focus-visible:ring-brand-navy',
      vitality:
        'bg-brand-green hover:bg-brand-green-dark text-white shadow-sm focus-visible:ring-brand-green',
      glass:
        'hud-glass hover:bg-white/95 text-brand-navy shadow-hud-glass focus-visible:ring-brand-primary',
      outline:
        'border border-brand-border-subtle hover:bg-brand-surface text-brand-navy focus-visible:ring-brand-primary',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
