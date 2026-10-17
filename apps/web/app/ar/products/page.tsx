'use client';

import * as React from 'react';
import { Sparkles, Filter, Search } from 'lucide-react';
import { MOCK_PRODUCTS_AR } from '@mirage/types';
import { ProductCard } from '@mirage/ui';
import { ProductHeroSlider } from '@/components/products/ProductHeroSlider';

const CATEGORIES_AR = [
  { id: 'all', label: 'جميع المستحضرات', match: 'all' },
  { id: 'men', label: 'صحة الرجل', match: 'Men Health' },
  { id: 'women', label: 'صحة المرأة', match: 'Women Health' },
  { id: 'vitamins', label: 'فيتامينات ومعادن', match: 'Vitamins & Minerals' },
  { id: 'maternal', label: 'رعاية الأمومة', match: 'Maternal Care' },
  { id: 'pediatrics', label: 'الأطفال والمناعة', match: 'Pediatrics & Immunity' },
] as const;

export default function ArabicProductsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchFilter, setSearchFilter] = React.useState<string>('');

  const filteredProducts = MOCK_PRODUCTS_AR.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      searchFilter === '' ||
      product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      product.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (product.tagline && product.tagline.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner (matching Hetero Cure Image 2 layout) */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          <div>
            <span className="font-heading font-black text-xs uppercase tracking-widest text-brand-cyan-light flex items-center justify-center md:justify-start gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              مختبرات Naturals 4be — علوم الحياة والتركيبات الطبية
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white">
              المستحضرات الدوائية
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
              نساعدك على التمتع بحياة صحية متكاملة عبر نقاء وفاعلية التركيبات الإكلينيكية المعتمدة.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-xs font-mono text-slate-200">
            <span className="text-emerald-400 font-bold">5 مستحضرات معتمدة</span> • معايير GxP الدوائية
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Featured Hero Slider */}
        <ProductHeroSlider products={MOCK_PRODUCTS_AR} isArabic={true} />

        {/* Filter and Search Bar Strip */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-brand-border-subtle shadow-sm">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-brand-navy shrink-0 ml-1" />
            {CATEGORIES_AR.map((cat) => {
              const active = selectedCategory === cat.match;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.match)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input Filter */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="ابحث باسم المستحضر أو المادة الفعالة..."
              className="w-full pr-9 pl-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-right"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Products List (Horizontal Rows matching Hetero Cure Image 2) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-brand-navy">
              المستحضرات المتوفرة ({filteredProducts.length})
            </h2>
            <span className="text-xs text-brand-text-muted font-mono">
              عرض المحفظة الدوائية المعتمدة سريرياً
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-brand-border-subtle">
              <p className="text-brand-text-muted text-sm font-medium">
                لم يتم العثور على أي مستحضرات مطابقة لبحثك. يرجى تعديل معايير البحث أو اختيار تصنيف آخر.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="row"
                  isArabic={true}
                  readMoreHref={`/ar/products/${product.slug}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
