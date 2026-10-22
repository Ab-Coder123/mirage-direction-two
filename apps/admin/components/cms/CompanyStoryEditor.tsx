'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  DEFAULT_COMPANY_STORY_CONTENT,
  type CompanyStoryInput,
} from '@mirage/db';
import {
  saveCompanyStoryAction,
  getCompanyStoryAction,
} from '../../app/settings/company-actions';
import {
  Globe2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  FileText,
  Eye,
  Loader2,
  Clock,
  Building2,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react';
import { Button } from '@mirage/ui';

export default function CompanyStoryEditor() {
  const [formData, setFormData] = useState<CompanyStoryInput>({
    heroTitleEn: DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn,
    heroTitleAr: DEFAULT_COMPANY_STORY_CONTENT.heroTitleAr,
    heroSubtitleEn: DEFAULT_COMPANY_STORY_CONTENT.heroSubtitleEn,
    heroSubtitleAr: DEFAULT_COMPANY_STORY_CONTENT.heroSubtitleAr,
    visionTitleEn: DEFAULT_COMPANY_STORY_CONTENT.visionTitleEn,
    visionTitleAr: DEFAULT_COMPANY_STORY_CONTENT.visionTitleAr,
    visionQuoteEn: DEFAULT_COMPANY_STORY_CONTENT.visionQuoteEn,
    visionQuoteAr: DEFAULT_COMPANY_STORY_CONTENT.visionQuoteAr,
    capitalEn: DEFAULT_COMPANY_STORY_CONTENT.capitalEn,
    capitalAr: DEFAULT_COMPANY_STORY_CONTENT.capitalAr,
    annualVolumeEn: DEFAULT_COMPANY_STORY_CONTENT.annualVolumeEn,
    annualVolumeAr: DEFAULT_COMPANY_STORY_CONTENT.annualVolumeAr,
    workforceEn: DEFAULT_COMPANY_STORY_CONTENT.workforceEn,
    workforceAr: DEFAULT_COMPANY_STORY_CONTENT.workforceAr,
    headquartersEn: DEFAULT_COMPANY_STORY_CONTENT.headquartersEn,
    headquartersAr: DEFAULT_COMPANY_STORY_CONTENT.headquartersAr,
  });

  const [metadata, setMetadata] = useState<{
    updatedAt: string | null;
    updatedBy: string | null;
    storageMode: 'mongodb' | 'file';
    storageLabel: string;
  }>({
    updatedAt: null,
    updatedBy: null,
    storageMode: 'file',
    storageLabel: 'Durable Local Shared Storage',
  });

  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [revalidationNotice, setRevalidationNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    getCompanyStoryAction().then((res) => {
      if (!active) return;
      if (res.warning) {
        setErrorMessage(`Storage notice: ${res.warning}`);
      }
      if (res.content) {
        setFormData({
          heroTitleEn: res.content.heroTitleEn,
          heroTitleAr: res.content.heroTitleAr,
          heroSubtitleEn: res.content.heroSubtitleEn,
          heroSubtitleAr: res.content.heroSubtitleAr,
          visionTitleEn: res.content.visionTitleEn,
          visionTitleAr: res.content.visionTitleAr,
          visionQuoteEn: res.content.visionQuoteEn,
          visionQuoteAr: res.content.visionQuoteAr,
          capitalEn: res.content.capitalEn,
          capitalAr: res.content.capitalAr,
          annualVolumeEn: res.content.annualVolumeEn,
          annualVolumeAr: res.content.annualVolumeAr,
          workforceEn: res.content.workforceEn,
          workforceAr: res.content.workforceAr,
          headquartersEn: res.content.headquartersEn,
          headquartersAr: res.content.headquartersAr,
        });
        setMetadata({
          updatedAt: res.content.updatedAt ?? null,
          updatedBy: res.content.updatedBy ?? null,
          storageMode: res.storage.mode,
          storageLabel:
            res.source === 'default' && res.storage.mode === 'mongodb'
              ? 'MongoDB (Offline — Static Fallback)'
              : res.storage.label,
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field: keyof CompanyStoryInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleReset = () => {
    setFormData({
      heroTitleEn: DEFAULT_COMPANY_STORY_CONTENT.heroTitleEn,
      heroTitleAr: DEFAULT_COMPANY_STORY_CONTENT.heroTitleAr,
      heroSubtitleEn: DEFAULT_COMPANY_STORY_CONTENT.heroSubtitleEn,
      heroSubtitleAr: DEFAULT_COMPANY_STORY_CONTENT.heroSubtitleAr,
      visionTitleEn: DEFAULT_COMPANY_STORY_CONTENT.visionTitleEn,
      visionTitleAr: DEFAULT_COMPANY_STORY_CONTENT.visionTitleAr,
      visionQuoteEn: DEFAULT_COMPANY_STORY_CONTENT.visionQuoteEn,
      visionQuoteAr: DEFAULT_COMPANY_STORY_CONTENT.visionQuoteAr,
      capitalEn: DEFAULT_COMPANY_STORY_CONTENT.capitalEn,
      capitalAr: DEFAULT_COMPANY_STORY_CONTENT.capitalAr,
      annualVolumeEn: DEFAULT_COMPANY_STORY_CONTENT.annualVolumeEn,
      annualVolumeAr: DEFAULT_COMPANY_STORY_CONTENT.annualVolumeAr,
      workforceEn: DEFAULT_COMPANY_STORY_CONTENT.workforceEn,
      workforceAr: DEFAULT_COMPANY_STORY_CONTENT.workforceAr,
      headquartersEn: DEFAULT_COMPANY_STORY_CONTENT.headquartersEn,
      headquartersAr: DEFAULT_COMPANY_STORY_CONTENT.headquartersAr,
    });
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage('Reset form to official brand defaults. Click "Save & Publish" to commit.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setRevalidationNotice(null);

    startTransition(async () => {
      const result = await saveCompanyStoryAction(formData);
      if (!result.ok) {
        setErrorMessage(result.error);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      } else {
        setSuccessMessage('Company Profile & Story successfully published to live website!');
        setMetadata({
          updatedAt: result.content.updatedAt ?? new Date().toISOString(),
          updatedBy: result.content.updatedBy ?? 'Admin Operator',
          storageMode: result.storage.mode,
          storageLabel: result.storage.label,
        });
        setRevalidationNotice(result.revalidation.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* CMS Header & Storage Indicator */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-50 text-brand-primary border border-sky-200">
              Live Website CMS
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                metadata.storageMode === 'mongodb'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {metadata.storageMode === 'mongodb' ? (
                <Database className="w-3 h-3 text-emerald-600" />
              ) : (
                <FileText className="w-3 h-3 text-amber-600" />
              )}
              {metadata.storageLabel}
            </span>
          </div>
          <h2 className="font-heading font-black text-xl text-brand-navy">
            Company Story & Corporate Facts CMS
          </h2>
          <p className="text-xs text-brand-text-muted mt-0.5">
            Edit corporate vision, narrative quote, capital numbers, and headquarters displayed on /our-story &amp; /ar/our-story.
          </p>
        </div>

        {metadata.updatedAt ? (
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last published: {new Date(metadata.updatedAt).toLocaleTimeString()}</span>
          </div>
        ) : null}
      </div>

      {/* Notifications */}
      {errorMessage ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Save Failed: </span>
            {errorMessage}
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">{successMessage}</div>
            {revalidationNotice ? (
              <div className="text-[11px] text-emerald-700 mt-0.5 font-mono">
                {revalidationNotice}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'en'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              English Copy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ar')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'ar'
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              المحتوى العربي (Arabic)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {activeTab === 'en' ? (
              <>
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    English Hero Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.heroTitleEn}
                    onChange={(e) => handleChange('heroTitleEn', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-bold"
                  />
                  {fieldErrors.heroTitleEn ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.heroTitleEn}</span>
                  ) : null}
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    English Hero Subtitle / Lead Paragraph *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.heroSubtitleEn}
                    onChange={(e) => handleChange('heroSubtitleEn', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy"
                  />
                  {fieldErrors.heroSubtitleEn ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.heroSubtitleEn}</span>
                  ) : null}
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    English Vision Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.visionTitleEn}
                    onChange={(e) => handleChange('visionTitleEn', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold"
                  />
                  {fieldErrors.visionTitleEn ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.visionTitleEn}</span>
                  ) : null}
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    English Vision Quote (New Vision • New Era) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.visionQuoteEn}
                    onChange={(e) => handleChange('visionQuoteEn', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy leading-relaxed"
                  />
                  {fieldErrors.visionQuoteEn ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.visionQuoteEn}</span>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      Capital (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.capitalEn}
                      onChange={(e) => handleChange('capitalEn', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      Annual Business Volume (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.annualVolumeEn}
                      onChange={(e) => handleChange('annualVolumeEn', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      Number of Employees (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.workforceEn}
                      onChange={(e) => handleChange('workforceEn', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      Headquarters (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headquartersEn}
                      onChange={(e) => handleChange('headquartersEn', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-medium"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div dir="rtl">
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    عنوان البانر الرئيسي بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.heroTitleAr}
                    onChange={(e) => handleChange('heroTitleAr', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-bold text-right"
                  />
                  {fieldErrors.heroTitleAr ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.heroTitleAr}</span>
                  ) : null}
                </div>

                <div dir="rtl">
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    المقدمة التعريفية بالعربية *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.heroSubtitleAr}
                    onChange={(e) => handleChange('heroSubtitleAr', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy text-right"
                  />
                  {fieldErrors.heroSubtitleAr ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.heroSubtitleAr}</span>
                  ) : null}
                </div>

                <div dir="rtl">
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    عنوان الرؤية الجديدة بالعربية *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.visionTitleAr}
                    onChange={(e) => handleChange('visionTitleAr', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-semibold text-right"
                  />
                  {fieldErrors.visionTitleAr ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.visionTitleAr}</span>
                  ) : null}
                </div>

                <div dir="rtl">
                  <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    نص بيان الرؤية (رؤية جديدة لعصر جديد) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.visionQuoteAr}
                    onChange={(e) => handleChange('visionQuoteAr', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy leading-relaxed text-right"
                  />
                  {fieldErrors.visionQuoteAr ? (
                    <span className="text-[11px] text-rose-600">{fieldErrors.visionQuoteAr}</span>
                  ) : null}
                </div>

                <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      رأس المال المدفوع *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.capitalAr}
                      onChange={(e) => handleChange('capitalAr', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-bold text-right"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      حجم الأعمال السنوي *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.annualVolumeAr}
                      onChange={(e) => handleChange('annualVolumeAr', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy font-bold text-right"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      عدد الموظفين (Number of Employees) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.workforceAr}
                      onChange={(e) => handleChange('workforceAr', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy text-right"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                      المقر الرئيسي *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headquartersAr}
                      onChange={(e) => handleChange('headquartersAr', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-brand-navy text-right"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isPending}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Defaults
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save &amp; Publish Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-primary" />
                Live Fact Sheet Preview
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewLocale('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    previewLocale === 'en'
                      ? 'bg-white text-brand-navy shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewLocale('ar')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    previewLocale === 'ar'
                      ? 'bg-white text-brand-navy shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  AR
                </button>
              </div>
            </div>

            {/* Preview Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#023368] to-[#0a66c2] text-white">
              <span className="text-[10px] font-mono text-cyan-200 uppercase tracking-wider block">
                {previewLocale === 'en' ? 'Est. 2019 • Healthy Life' : 'تأسست عام 2019 • Healthy Life'}
              </span>
              <h3 className="font-heading font-black text-lg text-white mt-1">
                {previewLocale === 'en' ? formData.heroTitleEn : formData.heroTitleAr}
              </h3>
              <p className="text-xs text-slate-200 mt-1 line-clamp-2">
                {previewLocale === 'en' ? formData.heroSubtitleEn : formData.heroSubtitleAr}
              </p>
            </div>

            {/* Preview Quote */}
            <div className="p-4 rounded-2xl bg-slate-50 border-l-4 border-brand-primary text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-brand-primary block">
                {previewLocale === 'en' ? formData.visionTitleEn : formData.visionTitleAr}
              </span>
              <p className="text-slate-700 italic">
                &ldquo;{previewLocale === 'en' ? formData.visionQuoteEn : formData.visionQuoteAr}&rdquo;
              </p>
            </div>

            {/* Preview Fact Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Building2 className="w-4 h-4 text-brand-primary mb-1" />
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  {previewLocale === 'en' ? 'Paid-In Capital' : 'رأس المال المدفوع'}
                </span>
                <span className="font-bold text-brand-navy font-mono">
                  {previewLocale === 'en' ? formData.capitalEn : formData.capitalAr}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <TrendingUp className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  {previewLocale === 'en' ? 'Business Volume' : 'حجم الأعمال'}
                </span>
                <span className="font-bold text-brand-navy font-mono">
                  {previewLocale === 'en' ? formData.annualVolumeEn : formData.annualVolumeAr}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <Users className="w-4 h-4 text-cyan-600 mb-1" />
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  {previewLocale === 'en' ? 'Employees' : 'عدد الموظفين'}
                </span>
                <span className="font-bold text-brand-navy text-[11px]">
                  {previewLocale === 'en' ? formData.workforceEn : formData.workforceAr}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <MapPin className="w-4 h-4 text-rose-600 mb-1" />
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  {previewLocale === 'en' ? 'Headquarters' : 'المقر الرئيسي'}
                </span>
                <span className="font-bold text-brand-navy text-[11px] truncate block">
                  {previewLocale === 'en' ? formData.headquartersEn : formData.headquartersAr}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
