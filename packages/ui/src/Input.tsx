import * as React from 'react';
import { cn } from '@mirage/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#023368]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg text-sm bg-white/80 border border-[#E2E8F0] text-[#023368] placeholder:text-slate-400',
            'transition-colors duration-200 outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#2878BC] focus-visible:border-transparent',
            'disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed',
            error && 'border-rose-500 focus-visible:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-rose-600 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
