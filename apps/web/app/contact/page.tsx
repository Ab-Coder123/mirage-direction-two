'use client';

import * as React from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge } from '@mirage/ui';
import { submitB2BLead } from '@mirage/db';

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      submitB2BLead({
        company_name: `${formData.name} (${formData.subject})`,
        contact_name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        partnership_archetype: 'Hospital Network',
        message: formData.message,
      });
    } catch (err) {
      console.error('Contact lead submission error:', err);
    }
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-[#020F24] pb-20 transition-colors duration-200">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] dark:from-[#011B3B] dark:via-[#023368] dark:to-[#022852] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30 dark:border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <Badge variant="cyan" size="md">
            Direct Clinical Support
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
            CONTACT US
          </h1>
          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
            Reach out to our medical scientific team, customer service specialists, or pharmacy distribution network.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Cards & Coordinates (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="glass" className="p-8 space-y-6">
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white">
                Mirage Pharma Headquarters
              </h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-300 leading-relaxed">
                Our main corporate headquarters and scientific liaison bureau are located in Zamalek, Cairo, coordinating manufacturing, logistics, and distributor supplies nationwide.
              </p>

              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-cyan-light flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy dark:text-brand-cyan-light block text-xs uppercase tracking-wider">
                      Physical Address:
                    </span>
                    <p className="text-sm">Mohamed ElMaraashly St, Building 1, Abu El-Feda, Zamalek, Cairo, Egypt</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy dark:text-brand-cyan-light block text-xs uppercase tracking-wider">
                      Direct Telephone:
                    </span>
                    <p className="font-mono text-sm">
                      <a href="tel:+201000499587" className="hover:text-brand-primary dark:hover:text-brand-cyan-light transition-colors">+20 10 00499587</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 dark:bg-brand-cyan/20 text-brand-cyan dark:text-brand-cyan-light flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy dark:text-brand-cyan-light block text-xs uppercase tracking-wider">
                      Inquiries Email:
                    </span>
                    <a
                      href="mailto:info@miragepharma.com"
                      className="font-mono text-sm text-brand-primary dark:text-brand-cyan-light hover:underline"
                    >
                      info@miragepharma.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy dark:text-brand-cyan-light block text-xs uppercase tracking-wider">
                      Operating Hours:
                    </span>
                    <p className="text-xs text-brand-text-muted dark:text-slate-400">
                      Sunday – Thursday: 9:00 AM – 6:00 PM (Cairo Local Time)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Regulatory Consultation Pill */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-primary text-white space-y-2 border border-transparent dark:border-white/10">
              <span className="font-heading font-bold text-base block">
                Healthcare Professionals & Clinics
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                Medical practitioners can request sampling kits, presentation monographs, and clinical trial reprints directly through our field medical liaisons.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white dark:bg-[#041B3B] border border-brand-border-subtle dark:border-white/10 p-8 sm:p-10 shadow-sm transition-colors">
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy dark:text-white mb-2">
                Send a Clinical or Order Inquiry
              </h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-300 mb-6">
                Please complete the form below. A licensed medical representative will respond within 24 business hours.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="font-heading font-bold text-xl text-emerald-900 dark:text-emerald-200">
                    Inquiry Received Successfully!
                  </h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                    Thank you, {formData.name}. Your inquiry has been routed to our medical affairs department. A representative will contact you via {formData.email || formData.phone}.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="mt-4"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-navy dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. / Pharmacist / Patient Name"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#020F24] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white dark:placeholder-slate-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@hospital.com or personal"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#020F24] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white dark:placeholder-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-navy dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="010XXXXXXXX or international"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#020F24] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white dark:placeholder-slate-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#020F24] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white transition-colors"
                      >
                        <option value="General Inquiry" className="dark:bg-[#020F24]">General Formulation Inquiry</option>
                        <option value="Physician Sampling" className="dark:bg-[#020F24]">HCP Sample Kit Request</option>
                        <option value="Pharmacy Distribution" className="dark:bg-[#020F24]">Pharmacy Stock & Supply</option>
                        <option value="Adverse Reaction" className="dark:bg-[#020F24]">Adverse Event / Pharmacovigilance</option>
                        <option value="Scientific Dossiers" className="dark:bg-[#020F24]">Clinical Study Dossier Request</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy dark:text-slate-200 mb-1.5 uppercase tracking-wider">
                      Message / Inquiry Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please specify the product, batch number, or clinical inquiry..."
                      className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-[#020F24] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white dark:placeholder-slate-500 transition-colors"
                    />
                  </div>

                  <Button variant="primary" size="lg" type="submit" className="w-full font-bold shadow-md cursor-pointer">
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Medical Affairs</span>
                    </span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
