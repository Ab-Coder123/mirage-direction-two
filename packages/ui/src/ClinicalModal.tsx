'use client';

import * as React from 'react';
import { cn } from '@mirage/utils';

export interface ClinicalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  gxpBadge?: string;
  mode?: 'dialog' | 'sheet';
  maxWidthClass?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ClinicalModal: React.FC<ClinicalModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  gxpBadge = '21 CFR PART 11 VERIFIED',
  mode = 'dialog',
  maxWidthClass = 'max-w-2xl',
  children,
  footer,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        mode === 'sheet'
          ? 'justify-end'
          : 'items-center justify-center p-4 sm:p-6'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="clinical-modal-title"
    >
      {/* Glassmorphic Obsidian Backdrop */}
      <div
        className="fixed inset-0 bg-[#020F24]/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Sheet Container */}
      <div
        className={cn(
          'relative z-10 bg-white border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden text-[#023368]',
          mode === 'sheet'
            ? 'w-full max-w-xl h-full rounded-l-3xl'
            : cn('w-full rounded-3xl max-h-[88vh]', maxWidthClass)
        )}
      >
        {/* Clinical HUD Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#020F24] to-[#023368] text-white flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            {gxpBadge ? (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 font-mono text-[10px] font-bold uppercase tracking-widest text-[#61C0E4]">
                {gxpBadge}
              </span>
            ) : null}
            <h2
              id="clinical-modal-title"
              className="font-heading font-extrabold text-lg sm:text-xl text-white"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="text-xs text-slate-300 font-mono">{subtitle}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 font-mono text-xs text-white transition-colors shrink-0"
            aria-label="Close modal"
          >
            ESC ✕
          </button>
        </div>

        {/* Scrollable Clinical Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">{children}</div>

        {/* Electronic Signature / Action Footer */}
        {footer ? (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

ClinicalModal.displayName = 'ClinicalModal';
