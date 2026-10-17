import * as React from 'react';
import { Leaf, CheckCircle2, FlaskConical } from 'lucide-react';
import { RawMaterial } from '@mirage/types';
import { cn } from '@mirage/utils';

export interface RawMaterialCardProps {
  material: RawMaterial;
  className?: string;
  isArabic?: boolean;
}

export const RawMaterialCard: React.FC<RawMaterialCardProps> = ({ material, className, isArabic = false }) => {
  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-white border border-brand-border-subtle p-6 shadow-sm transition-all duration-300 hover:shadow-hud-glass hover:border-brand-primary/40',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Botanical Icon Pill */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-green/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-105 transition-transform">
          <Leaf className="w-6 h-6 text-brand-green" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-2 mb-1">
            <h4 className="font-heading text-lg font-bold text-brand-navy">
              {material.name}
            </h4>
            {material.botanicalName && (
              <span className="text-xs italic text-brand-primary font-mono" dir="ltr">
                ({material.botanicalName})
              </span>
            )}
          </div>

          {/* Benefits List */}
          <ul className="space-y-2 mt-3 text-sm text-brand-text-muted">
            {material.keyBenefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Mechanism Badge */}
          {material.mechanism && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-brand-navy/80 bg-brand-surface p-2.5 rounded-lg border border-slate-200/60 font-sans">
              <FlaskConical className="w-4 h-4 text-brand-cyan shrink-0" />
              <span className="font-medium">
                <strong className="text-brand-navy">{isArabic ? 'الآلية البيوكيميائية للعمل:' : 'Biochemical Action:'}</strong> {material.mechanism}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
