'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@mirage/utils';

export interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, compact = false }) => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isAr = pathname?.startsWith('/ar');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

  const label = React.useMemo(() => {
    if (isAr) {
      return isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي';
    }
    return isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }, [isAr, isDark]);

  if (!mounted) {
    // Render static placeholder before mount to prevent layout shift
    return (
      <div
        className={cn(
          compact ? 'w-8 h-8' : 'w-9 h-9',
          'rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center border border-transparent',
          className
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'relative rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
        compact ? 'w-8 h-8' : 'w-9 h-9',
        'outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        // Light mode styling
        'bg-slate-100 hover:bg-brand-primary/10 text-slate-700 hover:text-brand-primary border border-slate-200/80',
        // Dark mode styling
        'dark:bg-white/10 dark:hover:bg-white/15 dark:text-brand-cyan-light dark:hover:text-white dark:border-white/10',
        className
      )}
    >
      {/* Sun Icon (Visible in Dark Mode) */}
      <Sun
        className={cn(
          'w-4 h-4 transition-all duration-300 absolute',
          isDark
            ? 'rotate-0 scale-100 opacity-100 text-amber-300'
            : '-rotate-90 scale-0 opacity-0'
        )}
      />

      {/* Moon Icon (Visible in Light Mode) */}
      <Moon
        className={cn(
          'w-4 h-4 transition-all duration-300 absolute',
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100 text-brand-navy'
        )}
      />

      <span className="sr-only">{label}</span>
    </button>
  );
};
