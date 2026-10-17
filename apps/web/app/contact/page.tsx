'use client';

import * as React from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Button, Card, Badge } from '@mirage/ui';

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
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Banner */}
      <section className="relative bg-gradient-to-r from-[#023368] via-[#054b98] to-[#0a66c2] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-brand-primary/30">
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
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy">
                Mirage Pharma Headquarters
              </h3>
              <p className="text-sm text-brand-text-muted leading-relaxed">
                Our main offices and regulatory liaison bureau are situated in New Cairo, coordinating logistics and distributor supplies nationwide.
              </p>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      Physical Address:
                    </span>
                    <p className="text-sm">Villa 270 AL Andalus, Fifth Settlement, Cairo, Egypt</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      Direct Telephones:
                    </span>
                    <p className="font-mono text-sm">
                      <a href="tel:01070786720" className="hover:text-brand-primary">01070786720</a> • <a href="tel:01070786721" className="hover:text-brand-primary">01070786721</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      Inquiries Email:
                    </span>
                    <a
                      href="mailto:info@hetero-cure.com"
                      className="font-mono text-sm text-brand-primary hover:underline"
                    >
                      info@hetero-cure.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-brand-navy block text-xs uppercase tracking-wider">
                      Operating Hours:
                    </span>
                    <p className="text-xs text-brand-text-muted">
                      Sunday – Thursday: 9:00 AM – 6:00 PM (Cairo Local Time)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Regulatory Consultation Pill */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-primary text-white space-y-2">
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
            <div className="rounded-3xl bg-white border border-brand-border-subtle p-8 sm:p-10 shadow-sm">
              <h3 className="font-heading font-extrabold text-2xl text-brand-navy mb-2">
                Send a Clinical or Order Inquiry
              </h3>
              <p className="text-sm text-brand-text-muted mb-6">
                Please complete the form below. A licensed medical representative will respond within 24 business hours.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-heading font-bold text-xl text-emerald-900">
                    Inquiry Received Successfully!
                  </h4>
                  <p className="text-sm text-emerald-700 max-w-md mx-auto">
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
                      <label className="block text-xs font-bold text-brand-navy mb-1.5 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Dr. / Pharmacist / Patient Name"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy mb-1.5 uppercase tracking-wider">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@hospital.com or personal"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-navy mb-1.5 uppercase tracking-wider">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="010XXXXXXXX or international"
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy mb-1.5 uppercase tracking-wider">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900"
                      >
                        <option value="General Inquiry">General Formulation Inquiry</option>
                        <option value="Physician Sampling">HCP Sample Kit Request</option>
                        <option value="Pharmacy Distribution">Pharmacy Stock & Supply</option>
                        <option value="Adverse Reaction">Adverse Event / Pharmacovigilance</option>
                        <option value="Scientific Dossiers">Clinical Study Dossier Request</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5 uppercase tracking-wider">
                      Message / Inquiry Details *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please specify the product, batch number, or clinical inquiry..."
                      className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-brand-primary text-slate-900"
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
