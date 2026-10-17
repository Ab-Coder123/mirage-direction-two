'use client';

import * as React from 'react';
import { Sparkles, Filter, Search } from 'lucide-react';
import { MOCK_PRODUCTS } from '@mirage/types';
import { ProductCard } from '@mirage/ui';
import { ProductHeroSlider } from '@/components/products/ProductHeroSlider';

const CATEGORIES = [
  'All Formulations',
  'Men Health',
  'Women Health',
  'Vitamins & Minerals',
  'Maternal Care',
  'Pediatrics & Immunity',
] as const;

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All Formulations');
  const [searchFilter, setSearchFilter] = React.useState<string>('');
  const deferredSearch = React.useDeferredValue(searchFilter);

  const filteredProducts = React.useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Formulations' || product.category === selectedCategory;
      const query = deferredSearch.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, deferredSearch]);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner (matching Hetero Cure Image 2) */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="font-heading font-black text-xs uppercase tracking-widest text-brand-cyan-light flex items-center justify-center md:justify-start gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              Naturals 4be Life Sciences
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white">
              PRODUCTS
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
              We help you to live a healthy life through clinical formulation purity.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-xs font-mono text-slate-200">
            <span className="text-emerald-400 font-bold">5 Registered Formulations</span> • GxP Standard
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Hero Slider (matching Inositol slider in Image 2) */}
        <ProductHeroSlider products={MOCK_PRODUCTS} />

        {/* Filter and Search Bar Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-brand-border-subtle shadow-sm">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-brand-navy shrink-0 mr-1" />
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input Filter */}
          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name or active compound..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Products List (Horizontal Rows matching Hetero Cure Image 2) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-brand-navy">
              Available Formulations ({filteredProducts.length})
            </h2>
            <span className="text-xs text-brand-text-muted font-mono">
              Showing active certified portfolio
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-brand-border-subtle">
              <p className="text-brand-text-muted text-sm">
                No formulations found matching your search. Please adjust your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="row"
                  className="w-full"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
