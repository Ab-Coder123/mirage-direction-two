import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Microscope, HeartHandshake, Award } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '@mirage/types';
import { Button, Badge, ProductCard, ReviewCard } from '@mirage/ui';

export default function HomePage() {
  const featuredProducts = MOCK_PRODUCTS;

  return (
    <main className="min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-brand-surface to-white py-16 md:py-24 border-b border-brand-border-subtle telemetry-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Naturals 4be — Phytotherapeutic Formulations</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight max-w-4xl mx-auto">
            Values-Led, Science-Backed <br />
            <span className="text-brand-primary">Dietary & Clinical Formulations</span>
          </h1>

          <p className="text-brand-text-muted text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Developing advanced, science-based formulations going beyond traditional nutritional supplements. Naturals 4be offers a range of functional health solutions using pure botanical ingredients and modern pharmaceutical delivery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="/products" className="flex items-center gap-2">
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/documents">
                Clinical Evidence & Dossiers
              </Link>
            </Button>
          </div>

          {/* Trust Metrics Pill Strip */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="hud-glass p-4 rounded-xl text-center border border-white/80">
              <Microscope className="w-5 h-5 text-brand-primary mx-auto mb-1" />
              <span className="font-heading font-bold text-lg text-brand-navy block">100%</span>
              <span className="text-xs text-brand-text-muted">Standardized Extracts</span>
            </div>
            <div className="hud-glass p-4 rounded-xl text-center border border-white/80">
              <ShieldCheck className="w-5 h-5 text-brand-green mx-auto mb-1" />
              <span className="font-heading font-bold text-lg text-brand-navy block">GxP Certified</span>
              <span className="text-xs text-brand-text-muted">Quality Assurance</span>
            </div>
            <div className="hud-glass p-4 rounded-xl text-center border border-white/80">
              <Award className="w-5 h-5 text-brand-cyan mx-auto mb-1" />
              <span className="font-heading font-bold text-lg text-brand-navy block">Peer-Reviewed</span>
              <span className="text-xs text-brand-text-muted">Clinical Literature</span>
            </div>
            <div className="hud-glass p-4 rounded-xl text-center border border-white/80">
              <HeartHandshake className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <span className="font-heading font-bold text-lg text-brand-navy block">99.4%</span>
              <span className="text-xs text-brand-text-muted">Patient Satisfaction</span>
            </div>
          </div>
        </div>
      </section>


      {/* OUR PRODUCTS Section (matching Hetero Cure Image 3) */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="primary" size="md">
            Product Portfolio
          </Badge>
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
            OUR PRODUCTS
          </h2>
          <p className="text-sm md:text-base text-brand-text-muted max-w-2xl mx-auto">
            Targeted health solutions engineered with pharmaceutical precision and clean active compounds.
          </p>
        </div>

        {/* Responsive Grid showcasing all 5 formulations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>

        {/* Show More Button (matching Hetero Cure Image 3) */}
        <div className="mt-12 text-center">
          <Button variant="secondary" size="lg" asChild className="px-8 shadow-md">
            <Link href="/products" className="flex items-center gap-2">
              <span>Show More Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CUSTOMER REVIEWS Section (matching Hetero Cure Image 3) */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-blue-50/40 border-t border-brand-border-subtle relative overflow-hidden">
        {/* Background Capsule Atmosphere */}
        <div className="absolute inset-0 opacity-5 pointer-events-none telemetry-grid" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="cyan" size="md">
              Clinical Feedback
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight">
              CUSTOMER REVIEWS
            </h2>
            <p className="text-sm md:text-base text-brand-text-muted max-w-2xl mx-auto">
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
    </main>
  );
}
