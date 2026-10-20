import Link from 'next/link';
import {
  ShieldCheck,
  Microscope,
  ArrowRight,
  Building2,
  TrendingUp,
  Users,
  Globe2,
  Calendar,
  Briefcase,
  Award,
  MapPin,
} from 'lucide-react';
import { Button, Badge, Card } from '@mirage/ui';

export default function OurStoryPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#011B3B] dark:via-[#023368] dark:to-[#022852] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            Est. 2019 • Healthy Life
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            MIRAGE PHARMA
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium max-w-3xl mx-auto">
            One of the leading industrial manufacturing & trading enterprises in the food supplements and medicine industry in Egypt and the Middle East.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Executive Corporate Profile & New Vision New Era */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light text-xs font-mono font-bold uppercase tracking-wider">
              Corporate Overview
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-brand-navy dark:text-white leading-tight">
              New Vision, New Era in Healthcare Excellence
            </h2>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Launched in <strong>2019</strong>, <strong>Mirage Pharma Company</strong> has developed to be one of the biggest trading and manufacturing organizations in the food supplements and medicine industry, owning a capital worth of <strong>50 Million EGP</strong> and an annual business volume reaching <strong>80 Million EGP</strong>.
            </p>
            <div className="p-6 rounded-2xl bg-white dark:bg-[#041B3B] border-l-4 border-brand-primary dark:border-brand-cyan-light shadow-sm space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light block">
                New Vision • New Era
              </span>
              <p className="text-sm sm:text-base text-brand-navy dark:text-slate-200 font-medium leading-relaxed">
                &ldquo;To be at the forefront of the healthcare industry in bringing complex brand and generic products to patients in the markets we serve. Our target products are carefully selected to fulfil and satisfy life&rsquo;s well-being.&rdquo;
              </p>
            </div>
            <p className="text-sm sm:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
              The main core of the Company&rsquo;s strategy is to build a broad portfolio of unique brands and generic products through <strong>Self Development</strong> and <strong>European &amp; American companies representations</strong> in Egypt and the Middle East — tackling unique development challenges, manufacturing challenges, and delivering advanced quality treatment options for future unmet health needs of the community.
            </p>
          </div>

          {/* Right Column: Official Corporate Fact Sheet Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-[#041B3B] dark:to-[#020F24] p-8 border border-brand-primary/20 dark:border-white/10 shadow-lg space-y-6 transition-colors">
              <div className="border-b border-brand-primary/15 dark:border-white/10 pb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-primary dark:text-brand-cyan-light">
                  Official Corporate Profile
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white mt-1">
                  Company Fact Sheet
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Calendar className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mb-1.5" />
                  <span className="text-[11px] font-mono uppercase text-brand-text-muted dark:text-slate-400 block">
                    Starting Date
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    2019
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Briefcase className="w-5 h-5 text-brand-green mb-1.5" />
                  <span className="text-[11px] font-mono uppercase text-brand-text-muted dark:text-slate-400 block">
                    Field of Work
                  </span>
                  <span className="font-heading font-extrabold text-base text-brand-navy dark:text-white">
                    Industrial &amp; Trading
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Building2 className="w-5 h-5 text-brand-cyan mb-1.5" />
                  <span className="text-[11px] font-mono uppercase text-brand-text-muted dark:text-slate-400 block">
                    Paid-In Capital
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    50 Million EGP
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <TrendingUp className="w-5 h-5 text-brand-green mb-1.5" />
                  <span className="text-[11px] font-mono uppercase text-brand-text-muted dark:text-slate-400 block">
                    Volume of Business
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    80 Million EGP
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <Users className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mb-1.5" />
                  <span className="text-[11px] font-mono uppercase text-brand-text-muted dark:text-slate-400 block">
                    Number of Employees
                  </span>
                  <span className="font-heading font-extrabold text-lg text-brand-navy dark:text-white">
                    75 + 500
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10">
                  <MapPin className="w-5 h-5 text-brand-cyan mb-1.5" />
                  <span className="text-[11px] font-mono uppercase text-brand-text-muted dark:text-slate-400 block">
                    HQ &amp; Branches
                  </span>
                  <span className="font-heading font-extrabold text-base text-brand-navy dark:text-white">
                    Cairo, Egypt
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#020F24]/70 border border-slate-200/70 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light shrink-0" />
                  <span className="text-xs font-bold text-brand-navy dark:text-white">
                    Core Services:
                  </span>
                </div>
                <p className="text-xs text-brand-text-muted dark:text-slate-300 leading-relaxed">
                  Manufacturing and trading food supplements and medicine across Egypt and regional markets.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Pillars Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" className="p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light flex items-center justify-center mb-2">
              <Microscope className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase">
              Strategy 01
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              Self-Development &amp; R&amp;D
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Building a broad portfolio of unique proprietary brands and generic formulations engineered to overcome complex development and bioavailability challenges.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center mb-2">
              <Globe2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-brand-green dark:text-emerald-400 uppercase">
              Strategy 02
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              European &amp; American Representation
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Official representation and strategic alliances with leading European and American pharmaceutical companies across Egypt and the Middle East.
            </p>
          </Card>

          <Card variant="glass" className="p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 text-brand-cyan dark:text-brand-cyan-light flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-bold text-brand-cyan dark:text-brand-cyan-light uppercase">
              Strategy 03
            </span>
            <h3 className="font-heading font-bold text-xl text-brand-navy dark:text-white">
              Industrial &amp; Quality Excellence
            </h3>
            <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
              Advanced quality treatment options manufactured under strict cGMP &amp; ISO standards to fulfill future unmet health needs of the community.
            </p>
          </Card>
        </section>

        {/* Call to Action Bar */}
        <section className="rounded-3xl bg-brand-navy dark:bg-[#041B3B] text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-transparent dark:border-white/10 transition-colors">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold">
            Explore Mirage Pharma&rsquo;s Medical Portfolio
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Discover our range of food supplements, medicines, and clinical formulations or inspect our peer-reviewed scientific dossiers.
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
