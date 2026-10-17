import { Lock, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner (matching Hetero Cure Image 1 exactly: green banner with illustration) */}
      <section className="relative bg-gradient-to-r from-[#2e7d32] via-[#388e3c] to-[#43a047] text-white py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-600/30 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative z-10">
          <div className="space-y-3">
            <span className="font-heading font-black text-xs uppercase tracking-widest text-emerald-200">
              Legal & Compliance Framework
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-white uppercase">
              PRIVACY POLICY
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-medium">
              Find out the answers to our most frequently asked questions and data protection standards.
            </p>
          </div>

          {/* Graphic Illustration Placeholder */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex flex-col items-center justify-center p-4 text-white shadow-xl shrink-0">
            <Lock className="w-12 h-12 text-emerald-200 mb-2" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-100 text-center">
              ISO 27001 Secure
            </span>
          </div>
        </div>
      </section>

      {/* Main Legal Content (matching Hetero Cure Image 1 structure) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-white border border-brand-border-subtle p-8 sm:p-12 shadow-sm space-y-10">
          {/* Header Sub-title */}
          <div className="border-b border-slate-100 pb-6">
            <h2 className="font-heading text-2xl font-extrabold text-brand-navy">
              Privacy Policy - Hetero Cure Pharma / Mirage Pharma
            </h2>
            <p className="text-xs font-mono text-brand-text-muted mt-1">
              Last Updated: 2026 • Version 2.4 (Egyptian Personal Data Protection Law No. 151/2020 Compliant)
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center font-mono">
                1
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy">
                Introduction
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-9">
              At Hetero Cure Pharma and Mirage Pharma, we value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website, communicate with our clinical representatives, and use our pharmaceutical inquiry services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center font-mono">
                2
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy">
                Information We Collect
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-9">
              We may collect personal information from you when you register on our site, request batch verification, or subscribe to our newsletter, including:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 pl-9">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Name, email address, mobile contact number, and healthcare professional license ID (if applicable).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Shipping, billing, and pharmacy distribution address when processing medical orders or sampling dispatches.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Any other clinical information or feedback you voluntarily provide when contacting our medical team.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center font-mono">
                3
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy">
                How We Use Your Information
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-9">
              We use your information exclusively for legitimate medical supply, patient service, and operational optimization:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 pl-9">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Process sample distribution, pharmacy orders, and provide real-time updates on dispatch and cold-chain status.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Improve user experience, scientific document indexing, and web portal responsiveness.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                <span>Send peer-reviewed clinical monographs, product formulations updates, and newsletters (if you explicitly opt-in).</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center font-mono">
                4
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy">
                Sharing Information
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-9">
              We do not sell, rent, or trade your personal information to third parties. However, we may share your data with trusted certified service providers (such as refrigerated cold-chain couriers and payment settlement gateways) who assist in operating our supply network, provided they strictly adhere to ISO 27001 data protection standards.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs flex items-center justify-center font-mono">
                5
              </span>
              <h3 className="font-heading font-bold text-lg text-brand-navy">
                Security & Data Integrity
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-9">
              We implement comprehensive physical, electronic, and managerial safeguards to protect your personal and clinical records against unauthorized access, alteration, or disclosure. All data transmissions are encrypted using 256-bit TLS/SSL protocols.
            </p>
          </section>

          {/* Contact for Privacy Questions */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-brand-navy block text-sm">
              Data Protection Officer Contact:
            </span>
            <p>
              If you have any questions or data removal requests regarding this Privacy Policy, please write to: <a href="mailto:info@hetero-cure.com" className="text-brand-primary font-mono font-bold hover:underline">info@hetero-cure.com</a> or visit our headquarters at Villa 270 AL Andalus, Fifth Settlement, Cairo, Egypt.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
