import * as React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { ClinicalEvidence } from '@mirage/types';
import { cn } from '@mirage/utils';

export interface ClinicalEvidenceCardProps {
  evidence: ClinicalEvidence;
  className?: string;
  isArabic?: boolean;
}

export const ClinicalEvidenceCard: React.FC<ClinicalEvidenceCardProps> = React.memo(({
  evidence,
  className,
  isArabic = false,
}) => {
  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 p-5 shadow-sm transition-all duration-300 hover:shadow-hud-glow hover:border-brand-primary/40 dark:hover:border-brand-primary/50',
        className
      )}
    >
      <div>
        {/* Journal Badge Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase bg-brand-navy/5 text-brand-navy border border-brand-navy/15 dark:bg-white/10 dark:text-brand-cyan-light dark:border-white/15">
            <BookOpen className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light" />
            {evidence.journalLogoText ?? evidence.journalName}
          </span>
          {evidence.year && (
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {evidence.year}
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h4 className="font-heading text-sm font-bold text-brand-navy dark:text-white leading-snug group-hover:text-brand-primary dark:group-hover:text-brand-cyan-light transition-colors">
          {evidence.paperTitle}
        </h4>

        {/* Authors */}
        {evidence.authors && (
          <p className="text-xs text-brand-text-muted dark:text-slate-400 mt-1 font-sans">
            {evidence.authors}
          </p>
        )}

        {/* Key finding snippet */}
        {evidence.keyFinding && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#020F24] border border-slate-100 dark:border-white/10 italic leading-relaxed">
            "{evidence.keyFinding}"
          </p>
        )}
      </div>

      {/* External Citation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono text-[11px]">
          {isArabic ? 'دراسة سريرية محكمة' : 'Peer-Reviewed Study'}
        </span>
        {evidence.doiUrl ? (
          <a
            href={evidence.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand-primary dark:text-brand-cyan-light hover:text-brand-navy dark:hover:text-white transition-colors"
          >
            <span>{isArabic ? 'عرض المصدر' : 'View Source'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-slate-400">{isArabic ? 'منشور مفهرس' : 'Indexed Publication'}</span>
        )}
      </div>
    </div>
  );
});

ClinicalEvidenceCard.displayName = 'ClinicalEvidenceCard';
