import * as React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { ClinicalEvidence } from '@mirage/types';
import { cn } from '@mirage/utils';

export interface ClinicalEvidenceCardProps {
  evidence: ClinicalEvidence;
  className?: string;
}

export const ClinicalEvidenceCard: React.FC<ClinicalEvidenceCardProps> = ({
  evidence,
  className,
}) => {
  return (
    <div
      className={cn(
        'group flex flex-col justify-between rounded-xl bg-white border border-brand-border-subtle p-5 shadow-sm transition-all duration-300 hover:shadow-hud-glow hover:border-brand-primary/40',
        className
      )}
    >
      <div>
        {/* Journal Badge Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase bg-brand-navy/5 text-brand-navy border border-brand-navy/15">
            <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
            {evidence.journalLogoText ?? evidence.journalName}
          </span>
          {evidence.year && (
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {evidence.year}
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h4 className="font-heading text-sm font-bold text-brand-navy leading-snug group-hover:text-brand-primary transition-colors">
          {evidence.paperTitle}
        </h4>

        {/* Authors */}
        {evidence.authors && (
          <p className="text-xs text-brand-text-muted mt-1 font-sans">
            {evidence.authors}
          </p>
        )}

        {/* Key finding snippet */}
        {evidence.keyFinding && (
          <p className="text-xs text-slate-600 mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 italic leading-relaxed">
            "{evidence.keyFinding}"
          </p>
        )}
      </div>

      {/* External Citation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono text-[11px]">Peer-Reviewed Study</span>
        {evidence.doiUrl ? (
          <a
            href={evidence.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:text-brand-navy transition-colors"
          >
            <span>View Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-slate-400">Indexed Publication</span>
        )}
      </div>
    </div>
  );
};
