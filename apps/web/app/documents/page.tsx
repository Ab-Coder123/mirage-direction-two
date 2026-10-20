'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Download,
  Microscope,
  Pill,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@mirage/types';
import { Button, RawMaterialCard, ClinicalEvidenceCard } from '@mirage/ui';

export default function DocumentsPage() {
  const [selectedProductSlug, setSelectedProductSlug] = React.useState<string>('sympdca');

  const activeProduct =
    MOCK_PRODUCTS.find((p) => p.slug === selectedProductSlug) || MOCK_PRODUCTS[0]!;

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner (matching Hetero Cure Image 4) */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#011B3B] dark:via-[#023368] dark:to-[#022852] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="font-heading font-black text-xs uppercase tracking-widest text-brand-cyan-light flex items-center justify-center md:justify-start gap-1.5 mb-2">
              <Microscope className="w-4 h-4" />
              Scientific Research & Regulatory Files
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white">
              DOCUMENTS
            </h1>
            <p className="text-sm sm:text-base text-slate-200 mt-2 font-medium">
              We help you live a healthy life through verified clinical literature & raw material transparency.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-xs font-mono text-slate-200">
            <span className="text-emerald-400 font-bold">Peer-Reviewed Dossiers</span> • Open Access
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Product Formulation Switcher Tabs */}
        <div className="bg-white dark:bg-[#041B3B] p-4 rounded-2xl border border-brand-border-subtle dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-brand-primary dark:text-brand-cyan-light shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-navy dark:text-white">
              Select Dossier:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {MOCK_PRODUCTS.map((prod) => {
              const active = prod.slug === selectedProductSlug;
              return (
                <button
                  key={prod.id}
                  onClick={() => setSelectedProductSlug(prod.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-slate-100 dark:bg-[#020F24] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-transparent dark:border-white/10'
                  }`}
                >
                  {prod.name}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`Downloading SmPC Clinical Dossier for ${activeProduct.name}...`)}
            className="text-xs flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary dark:text-brand-cyan-light" />
            <span>Download Dossier (PDF)</span>
          </Button>
        </div>

        {/* Selected Product Banner Card (matching Image 4 Header) */}
        <div className="rounded-3xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 transition-colors">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-blue-100 dark:from-[#020F24] dark:to-[#031530] flex items-center justify-center text-brand-primary dark:text-brand-cyan-light shrink-0 shadow-inner overflow-hidden p-1.5 border border-transparent dark:border-white/10">
              {activeProduct.heroImage ? (
                <img
                  src={activeProduct.heroImage}
                  alt={activeProduct.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-brand-primary dark:text-brand-cyan-light uppercase">
                  {activeProduct.brandLine}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                  {activeProduct.category}
                </span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-navy dark:text-white">
                {activeProduct.name}
              </h2>
              <p className="font-heading text-sm sm:text-base font-semibold text-brand-primary dark:text-brand-cyan-light">
                {activeProduct.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <span className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-[#020F24] text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-white/10 text-center w-full sm:w-auto">
              {activeProduct.arabicSubtitle}
            </span>
            <Button variant="primary" size="sm" asChild className="w-full sm:w-auto">
              <Link href={`/products/${activeProduct.slug}`}>
                View Product Details
              </Link>
            </Button>
          </div>
        </div>

        {/* SECTION 1: Raw Material (matching Hetero Cure Image 4) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-brand-primary/20 dark:border-brand-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-brand-primary rounded-full" />
              <h3 className="font-heading text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                Raw Material Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono text-brand-text-muted dark:text-slate-400">
              {activeProduct.rawMaterials.length} Standardized Bioactive Extracts
            </span>
          </div>

          <p className="text-sm text-brand-text-muted dark:text-slate-300">
            All botanical and chemical raw materials undergo rigorous HPLC testing, mass spectrometry, and heavy metal screening to guarantee safety and biochemical potency.
          </p>

          <div className="space-y-4">
            {activeProduct.rawMaterials.map((material) => (
              <RawMaterialCard key={material.id} material={material} />
            ))}
          </div>
        </section>

        {/* SECTION 2: Clinical Evidence (matching Hetero Cure Image 4) */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-brand-cyan/30">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-6 bg-brand-cyan rounded-full" />
              <h3 className="font-heading text-2xl sm:text-3xl font-black text-brand-navy dark:text-white tracking-tight">
                Clinical Evidence & Journal Citations
              </h3>
            </div>
            <span className="text-xs font-mono text-brand-text-muted dark:text-slate-400">
              Peer-Reviewed Medical Literature
            </span>
          </div>

          <p className="text-sm text-brand-text-muted dark:text-slate-300">
            Published medical and pharmacological trials validating the clinical efficacy and pharmacokinetic behavior of the formulations used in {activeProduct.name}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeProduct.clinicalEvidences.map((evidence) => (
              <ClinicalEvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
