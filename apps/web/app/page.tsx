import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Building2,
  TrendingUp,
  Users,
  Calendar,
  Globe2,
  Microscope,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_REVIEWS } from '@mirage/types';
import { Button, Badge, ProductCard, ReviewCard } from '@mirage/ui';
import { getHomepageHeroContent, loadProductsFromDb } from '@mirage/db/server';

export default async function HomePage() {
  const hero = await getHomepageHeroContent();
  const { products } = await loadProductsFromDb({ locale: 'en' });
  const featuredProducts = products.filter((p) => p.isFeatured);

  return (
    <main className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-brand-surface to-white dark:from-[#031530] dark:via-[#020F24] dark:to-[#020F24] py-16 md:py-24 border-b border-brand-border-subtle dark:border-white/10 telemetry-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary dark:text-brand-cyan-light text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>{hero.badgeEn}</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {hero.headlinePrefixEn} <br />
            <span className="text-brand-primary dark:text-brand-cyan-light">{hero.headlineHighlightEn}</span>
          </h1>

          <p className="text-brand-text-muted dark:text-slate-300 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            {hero.supportingTextEn}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/products" className="flex items-center gap-2">
                <span>{hero.primaryCtaTextEn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/our-story">
                {hero.secondaryCtaTextEn}
              </Link>
            </Button>
          </div>

          
      </section>

      {/* ABOUT MIRAGE PHARMA — Corporate Overview Section */}
      <section className="py-16 md:py-20 bg-white dark:bg-[#02132B] border-b border-brand-border-subtle dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <Badge variant="cyan" size="md">
                About Mirage Pharma
              </Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight leading-tight">
                At the Forefront of the Healthcare Industry
              </h2>
              <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
                To be at the forefront of the healthcare industry in bringing complex brand and generic products to patients in the markets we serve. Our target products are carefully selected to fulfil and satisfy life&rsquo;s well-being.
              </p>
              <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 leading-relaxed">
                The main core of the Company&rsquo;s strategy is to build a broad portfolio of unique brands and generic products through <strong>Self Development</strong>, <strong>European and American companies representations</strong> in Egypt and the Middle East — addressing unique development challenges, manufacturing challenges, and advanced quality treatment options for future unmet health needs of the community.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041B3B] border border-slate-200/70 dark:border-white/10">
                  <Microscope className="w-5 h-5 text-brand-primary dark:text-brand-cyan-light mb-1.5" />
                  <span className="font-heading font-bold text-sm text-brand-navy dark:text-white block">
                    Self-Development
                  </span>
                  <span className="text-xs text-brand-text-muted dark:text-slate-400">
                    Proprietary brands &amp; complex generics
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041B3B] border border-slate-200/70 dark:border-white/10">
                  <Globe2 className="w-5 h-5 text-brand-green mb-1.5" />
                  <span className="font-heading font-bold text-sm text-brand-navy dark:text-white block">
                    EU &amp; US Representation
                  </span>
                  <span className="text-xs text-brand-text-muted dark:text-slate-400">
                    International pharma partnerships
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#041B3B] border border-slate-200/70 dark:border-white/10">
                  <ShieldCheck className="w-5 h-5 text-brand-cyan mb-1.5" />
                  <span className="font-heading font-bold text-sm text-brand-navy dark:text-white block">
                    Industrial &amp; Trading
                  </span>
                  <span className="text-xs text-brand-text-muted dark:text-slate-400">
                    Food supplements &amp; medicine
                  </span>
                </div>
              </div>
            </div>

            {/* Right Fact Summary Box */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-gradient-to-br from-[#023368] to-[#0a66c2] dark:from-[#041B3B] dark:to-[#01142B] text-white p-8 shadow-xl border border-white/10 space-y-5">
                <div className="border-b border-white/15 pb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan-light block">
                    Key Corporate Facts
                  </span>
                  <h3 className="font-heading text-2xl font-extrabold mt-1">
                    Mirage Pharma At a Glance
                  </h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">Starting Date</span>
                    <span className="font-mono font-bold text-white">2019</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">Field of Work</span>
                    <span className="font-semibold text-white">Industrial &amp; Trading</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">Capital</span>
                    <span className="font-mono font-bold text-brand-cyan-light">50 Million EGP</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">Volume of Business</span>
                    <span className="font-mono font-bold text-emerald-300">80 Million EGP</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">Number of Employees</span>
                    <span className="font-mono font-bold text-white">75 + 500</span>
                  </li>
                  <li className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-slate-300">Headquarter &amp; Branches</span>
                    <span className="font-semibold text-white">Cairo</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-300">Countries We Work In</span>
                    <span className="font-semibold text-white">Egypt &amp; Middle East</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PRODUCTS Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="primary" size="md">
            Product Portfolio
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
            OUR PRODUCTS
          </h2>
          <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 max-w-2xl mx-auto">
            Targeted food supplements and medicine formulations selected to fulfill and satisfy life&rsquo;s well-being.
          </p>
        </div>

        {/* Responsive Grid showcasing formulations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>

        {/* Show More Button */}
        <div className="mt-12 text-center">
          <Button variant="secondary" size="lg" asChild className="px-8 shadow-md">
            <Link href="/products" className="flex items-center gap-2">
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CUSTOMER REVIEWS Section (only shown if verified reviews exist) */}
      {MOCK_REVIEWS.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-blue-50/40 dark:from-[#031530] dark:to-[#020F24] border-t border-brand-border-subtle dark:border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none telemetry-grid" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-3 mb-12">
              <Badge variant="cyan" size="md">
                Clinical Feedback
              </Badge>
              <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy dark:text-white tracking-tight">
                CUSTOMER REVIEWS
              </h2>
              <p className="text-sm md:text-base text-brand-text-muted dark:text-slate-300 max-w-2xl mx-auto">
                Testimonials from consulting physicians, healthcare specialists, and verified patients across Egypt.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_REVIEWS.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
