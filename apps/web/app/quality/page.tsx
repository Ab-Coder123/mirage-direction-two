import Link from 'next/link';
import { ShieldCheck, CheckCircle2, Award, ThermometerSnowflake, FileCheck2, ArrowRight } from 'lucide-react';
import { Button, Badge, Card } from '@mirage/ui';

export default function QualityPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 telemetry-grid">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="vitality" size="md">
            GxP Standardized Manufacturing
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            QUALITY & COMPLIANCE
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            Pharmaceutical-grade rigor applied to clinical nutrition: from botanical harvest batch testing to continuous cold-chain sensor monitoring.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Quality Protocols Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-navy">
              Analytical HPLC Testing
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Every incoming lot of raw botanical extract is analyzed via High-Performance Liquid Chromatography (HPLC) to verify active marker potency and eliminate adulterants.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>Heavy metal screening (Pb, Cd, Hg, As)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>Microbiological pathogen clearance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>Pesticide residue zero-tolerance assays</span>
              </li>
            </ul>
          </Card>

          <Card variant="glass" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-navy">
              cGMP Certified Cleanrooms
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Formulations are compounded, encapsulated, and blister-sealed in certified ISO Class 7 cleanrooms equipped with HEPA laminar air flow filtration.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>ISO 9001:2015 Quality Management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>ISO 22000 Food Safety Standards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>Positive air pressure differentials</span>
              </li>
            </ul>
          </Card>

          <Card variant="glass" className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center font-bold">
              <ThermometerSnowflake className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-brand-navy">
              Cold-Chain Assurance
            </h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">
              Temperature-sensitive formulations and lipid cofactors (such as CoQ10 and Methylcobalamin) are stored and transported under real-time IoT temperature telemetry.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>+2°C to +8°C refrigerated logistics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>24/7 Excursion threshold automated alarms</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span>Tamper-evident temperature loggers</span>
              </li>
            </ul>
          </Card>
        </section>

        {/* Verification Strip */}
        <section className="rounded-3xl bg-white border border-brand-border-subtle p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-brand-navy">
                Batch Analysis & Certificate of Analysis (CoA)
              </h3>
              <p className="text-sm text-brand-text-muted">
                Healthcare practitioners and pharmacies can request lot-specific analytical certificates directly from our quality assurance team.
              </p>
            </div>
          </div>

          <Button variant="primary" size="md" asChild className="shrink-0">
            <Link href="/contact" className="flex items-center gap-2">
              <span>Request Batch CoA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
