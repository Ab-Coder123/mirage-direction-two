import Link from 'next/link';
import { ShieldCheck, Microscope, HeartHandshake, ArrowRight } from 'lucide-react';
import { Button, Badge, Card } from '@mirage/ui';

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#011B3B] dark:via-[#023368] dark:to-[#022852] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            Our Heritage & Scientific Mission
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            OUR STORY
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            Bridging classical botanical medicine with contemporary molecular pharmacology to engineer high-potency, standardized phytotherapeutic health solutions.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Core Philosophy Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light">
              The Genesis of Naturals 4be
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white leading-tight">
              Pioneering Formulations for Human Longevity
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Founded on the conviction that everyday health supplements must adhere to the same uncompromising standards as prescription medicines, Mirage Pharma established the <strong>Naturals 4be</strong> division to eliminate filler-heavy, low-bioavailability formulations.
            </p>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Every compound in our portfolio — from standardized adaptogens in <em>Man Edge</em> to bio-identical 40:1 inositols in <em>Inositol Q10</em> — is titrated to exact clinical potency, supported by peer-reviewed literature and verifiable testing dossiers.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#041B3B] dark:to-[#020F24] p-8 border border-brand-primary/20 dark:border-white/10 shadow-lg space-y-6 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    Molecular Standardization
                  </h3>
                  <p className="text-xs text-brand-text-muted dark:text-slate-400">
                    Zero raw powders without verifiable HPLC chromatography assay certificates.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    Pharmaceutical GxP Purity
                  </h3>
                  <p className="text-xs text-brand-text-muted dark:text-slate-400">
                    Manufactured exclusively in cleanrooms certified under cGMP & ISO 22000.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan text-white flex items-center justify-center font-bold">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-brand-navy dark:text-white">
                    Patient Transparency
                  </h3>
                  <p className="text-xs text-brand-text-muted dark:text-slate-400">
                    Full open-access documentation of clinical trials and chemical constituents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-8 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase">
              Pillar 01
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              Evidence-Based R&D
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              We reject unsubstantiated marketing fads. Every product concept starts with a rigorous review of clinical meta-analyses, and dosage titration studies.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-green dark:text-emerald-400 uppercase">
              Pillar 02
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              Bioavailability First
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Using micro-encapsulation, methylated folate forms, and enteric protection to ensure active compounds survive gastric acid and achieve peak cellular uptake.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <span className="text-xs font-mono font-bold text-brand-cyan dark:text-brand-cyan-light uppercase">
              Pillar 03
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              Physician Partnership
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Formulated in collaborative consultation with consulting urologists, obstetricians, endocrinologists, and pediatric specialists across the MENA region.
            </p>
          </Card>
        </section>

        {/* Call to Action Bar */}
        <section className="rounded-3xl bg-brand-navy dark:bg-[#041B3B] text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-transparent dark:border-white/10 transition-colors">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold">
            Explore Our Certified Medical Portfolios
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Discover the full range of Naturals 4be formulations or inspect our peer-reviewed clinical dossiers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button variant="primary" size="lg" asChild className="bg-brand-primary text-white font-bold">
              <Link href="/products" className="flex items-center gap-2">
                <span>View Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-white/30 text-white hover:bg-white/10">
              <Link href="/documents">
                View Scientific Documents
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
