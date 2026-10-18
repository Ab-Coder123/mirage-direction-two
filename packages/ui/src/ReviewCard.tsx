import * as React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { CustomerReview } from '@mirage/types';
import { cn } from '@mirage/utils';

export interface ReviewCardProps {
  review: CustomerReview;
  className?: string;
  isArabic?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = React.memo(({ review, className, isArabic = false }) => {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl bg-white/90 dark:bg-[#041B3B] backdrop-blur-sm border border-brand-border-subtle dark:border-white/10 p-6 shadow-sm transition-all duration-300 hover:shadow-hud-glow hover:border-brand-primary/40 dark:hover:border-brand-primary/50',
        className
      )}
    >
      <div>
        {/* Stars Header & Quote Mark */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-4 h-4',
                  i < review.rating ? 'fill-current' : 'text-slate-200 fill-slate-200 dark:text-slate-700 dark:fill-slate-700'
                )}
              />
            ))}
          </div>
          <Quote className="w-5 h-5 text-brand-primary/20 dark:text-brand-cyan-light/30" />
        </div>

        {/* Comment */}
        <p className="text-sm text-brand-navy dark:text-slate-200 leading-relaxed italic mb-4">
          "{review.comment}"
        </p>
      </div>

      {/* Author & Verification Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
        <div>
          <h5 className="font-heading font-bold text-sm text-brand-navy dark:text-white">
            {review.authorName}
          </h5>
          <p className="text-xs text-brand-text-muted dark:text-slate-400">
            {review.authorRole} {review.location && `• ${review.location}`}
          </p>
        </div>

        {review.verified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green dark:text-emerald-400 bg-brand-green/10 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-brand-green/20 dark:border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            {isArabic ? 'تقييم معتمد' : 'Verified'}
          </span>
        )}
      </div>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';
