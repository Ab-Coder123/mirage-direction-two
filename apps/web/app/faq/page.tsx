'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@mirage/ui';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: 'Formulations & Ingredients',
    question: 'What makes Naturals 4be formulations different from generic supplements?',
    answer:
      'Unlike generic supplements that use unstandardized plant powders with erratic active compound levels, Naturals 4be utilizes standardized botanical extracts titrated to exact percentages (such as 85-95% fatty acids in Saw Palmetto, and standardized ginsenosides in Panax Ginseng). Every lot is certified via HPLC testing.',
  },
  {
    category: 'Formulations & Ingredients',
    question: 'Why is Inositol formulated in a 40:1 ratio?',
    answer:
      'The 40:1 ratio between Myo-Inositol and D-Chiro-Inositol represents the physiological plasma ratio found in healthy human follicular fluid. Clinical trials demonstrate that this exact ratio optimizes insulin sensitivity and oocyte maturation without triggering the androgenic side effects observed with higher D-Chiro dosages.',
  },
  {
    category: 'Administration & Safety',
    question: 'Are Mirage Pharma / Naturals 4be products safe for long-term daily use?',
    answer:
      'Yes. Our products are formulated as clinical-grade dietary supplements adhering to Egyptian Ministry of Health standards and European dietary safety limits. They do not contain synthetic hormones, prohibited stimulants, or toxic excipients.',
  },
  {
    category: 'Administration & Safety',
    question: 'Can I take multiple Naturals 4be products simultaneously?',
    answer:
      'In general, our formulations are designed to be complementary (for example, Man Edge with Folate B12, or Inositol with Folate B12). However, we always recommend consulting your attending physician or clinical pharmacist before starting any new supplementation regimen.',
  },
  {
    category: 'Storage & Cold-Chain',
    question: 'How should I store my products at home?',
    answer:
      'Most capsules should be stored in a cool, dry place below 25°C away from direct sunlight. Syrup formulations like VitaKids should be kept securely closed and refrigerated after opening, consumed within 30 days.',
  },
  {
    category: 'Distribution & Pharmacies',
    question: 'Where can I purchase genuine Naturals 4be products in Egypt?',
    answer:
      'Our products are distributed across leading pharmacy chains throughout Greater Cairo, Alexandria, and all Egyptian governorates. You can also request home delivery directly through our verified medical liaison network.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 telemetry-grid">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            Help & Knowledge Base
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            Find immediate clinical answers regarding our botanical standardization, dosage guidelines, and patient safety.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-brand-border-subtle overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-brand-primary uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-brand-navy">
                    {item.question}
                  </h3>
                </div>
                <div
                  className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-brand-primary text-white' : 'text-slate-600'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
