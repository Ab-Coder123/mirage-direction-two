'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  DEFAULT_HOMEPAGE_HERO_CONTENT,
  type HomepageHeroInput,
} from '@mirage/db';
import {
  saveHomepageHeroAction,
  getHomepageHeroAction,
} from '../../app/settings/homepage-actions';
import {
  Globe2,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Database,
  FileText,
  Eye,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
} from 'lucide-react';
import { Button, Badge } from '@mirage/ui';

export default function HomepageHeroEditor() {
  const [formData, setFormData] = useState<HomepageHeroInput>({
    badgeEn: DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn,
    badgeAr: DEFAULT_HOMEPAGE_HERO_CONTENT.badgeAr,
    headlinePrefixEn: DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn,
    headlineHighlightEn: DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightEn,
    headlinePrefixAr: DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr,
    headlineHighlightAr: DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightAr,
    supportingTextEn: DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextEn,
    supportingTextAr: DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextAr,
    primaryCtaTextEn: DEFAULT_HOMEPAGE_HERO_CONTENT.primaryCtaTextEn,
    primaryCtaTextAr: DEFAULT_HOMEPAGE_HERO_CONTENT.primaryCtaTextAr,
    secondaryCtaTextEn: DEFAULT_HOMEPAGE_HERO_CONTENT.secondaryCtaTextEn,
    secondaryCtaTextAr: DEFAULT_HOMEPAGE_HERO_CONTENT.secondaryCtaTextAr,
  });

  const [metadata, setMetadata] = useState<{
    updatedAt: string | null;
    updatedBy: string | null;
    storageMode: 'mongodb' | 'file';
    storageLabel: string;
  }>({
    updatedAt: null,
    updatedBy: null,
    storageMode: 'mongodb',
    storageLabel: 'MongoDB Primary Database',
  });

  const [previewLocale, setPreviewLocale] = useState<'en' | 'ar'>('en');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [revalidationNotice, setRevalidationNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load existing content on mount
  useEffect(() => {
    let active = true;
    getHomepageHeroAction().then((res) => {
      if (!active) return;
      if (res.warning) {
        setErrorMessage(`Storage notice: ${res.warning}`);
      }
      if (res.content) {
        setFormData({
          badgeEn: res.content.badgeEn,
          badgeAr: res.content.badgeAr,
          headlinePrefixEn: res.content.headlinePrefixEn,
          headlineHighlightEn: res.content.headlineHighlightEn,
          headlinePrefixAr: res.content.headlinePrefixAr,
          headlineHighlightAr: res.content.headlineHighlightAr,
          supportingTextEn: res.content.supportingTextEn,
          supportingTextAr: res.content.supportingTextAr,
          primaryCtaTextEn: res.content.primaryCtaTextEn,
          primaryCtaTextAr: res.content.primaryCtaTextAr,
          secondaryCtaTextEn: res.content.secondaryCtaTextEn,
          secondaryCtaTextAr: res.content.secondaryCtaTextAr,
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

  const handleChange = (field: keyof HomepageHeroInput, value: string) => {
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
      badgeEn: DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn,
      badgeAr: DEFAULT_HOMEPAGE_HERO_CONTENT.badgeAr,
      headlinePrefixEn: DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn,
      headlineHighlightEn: DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightEn,
      headlinePrefixAr: DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr,
      headlineHighlightAr: DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightAr,
      supportingTextEn: DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextEn,
      supportingTextAr: DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextAr,
      primaryCtaTextEn: DEFAULT_HOMEPAGE_HERO_CONTENT.primaryCtaTextEn,
      primaryCtaTextAr: DEFAULT_HOMEPAGE_HERO_CONTENT.primaryCtaTextAr,
      secondaryCtaTextEn: DEFAULT_HOMEPAGE_HERO_CONTENT.secondaryCtaTextEn,
      secondaryCtaTextAr: DEFAULT_HOMEPAGE_HERO_CONTENT.secondaryCtaTextAr,
    });
    setFieldErrors({});
    setErrorMessage(null);
    setSuccessMessage('Reset form to baseline defaults. Click "Save to Durable Storage" to apply.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const res = await saveHomepageHeroAction(formData);
      if (res.ok) {
        setSuccessMessage('Homepage content saved and persisted successfully.');
        setRevalidationNotice(res.revalidation.message);
        setMetadata({
          updatedAt: res.content.updatedAt ?? null,
          updatedBy: res.content.updatedBy ?? null,
          storageMode: res.storage.mode,
          storageLabel: res.storage.label,
        });
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(res.error || 'Failed to save content to durable repository.');
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors as Record<string, string>);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* CMS Subheader & Storage Diagnostics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-brand-navy">
              Homepage Hero Content CMS
            </h2>
            <p className="text-xs text-brand-text-muted">
              Live bilingual copy management synchronized to the public website (/ and /ar)
            </p>
          </div>
        </div>

        {/* Backend Persistence Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-1.5">
            {metadata.storageMode === 'mongodb' ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-emerald-700">{metadata.storageLabel}</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-semibold text-slate-700">Durable Shared File</span>
              </>
            )}
          </div>
          {metadata.updatedAt && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>{new Date(metadata.updatedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex flex-col gap-1 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          {revalidationNotice && (
            <p className="pl-6 text-[11px] text-emerald-700 font-mono">{revalidationNotice}</p>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dual Column Layout: Editor Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* English Content Section */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h3 className="font-heading text-sm font-bold text-brand-navy">
                  English Public Copy (LTR — /)
                </h3>
              </div>
              <Badge variant="primary" size="sm">
                EN Locale
              </Badge>
            </div>

            {/* Badge EN */}
            <div className="space-y-1">
              <label htmlFor="badgeEn" className="block text-xs font-bold text-slate-700">
                Hero Pill Badge (EN)
              </label>
              <input
                id="badgeEn"
                type="text"
                value={formData.badgeEn}
                onChange={(e) => handleChange('badgeEn', e.target.value)}
                placeholder="e.g., Mirage Pharma • Healthy Life • Est. 2019"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
              {fieldErrors.badgeEn && (
                <p className="text-[11px] text-rose-600 font-medium">{fieldErrors.badgeEn}</p>
              )}
            </div>

            {/* Headline Prefix + Highlight EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="headlinePrefixEn" className="block text-xs font-bold text-slate-700">
                  Headline Lead Text (EN)
                </label>
                <input
                  id="headlinePrefixEn"
                  type="text"
                  value={formData.headlinePrefixEn}
                  onChange={(e) => handleChange('headlinePrefixEn', e.target.value)}
                  placeholder="e.g., New Vision, New Era in"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
                {fieldErrors.headlinePrefixEn && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {fieldErrors.headlinePrefixEn}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="headlineHighlightEn" className="block text-xs font-bold text-slate-700">
                  Headline Highlight (Cyan/Blue)
                </label>
                <input
                  id="headlineHighlightEn"
                  type="text"
                  value={formData.headlineHighlightEn}
                  onChange={(e) => handleChange('headlineHighlightEn', e.target.value)}
                  placeholder="e.g., Food Supplements & Medicine"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-brand-primary"
                />
                {fieldErrors.headlineHighlightEn && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {fieldErrors.headlineHighlightEn}
                  </p>
                )}
              </div>
            </div>

            {/* Supporting Text EN */}
            <div className="space-y-1">
              <label htmlFor="supportingTextEn" className="block text-xs font-bold text-slate-700">
                Supporting Mission Paragraph (EN)
              </label>
              <textarea
                id="supportingTextEn"
                rows={3}
                value={formData.supportingTextEn}
                onChange={(e) => handleChange('supportingTextEn', e.target.value)}
                placeholder="Comprehensive corporate mission statement..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary leading-relaxed"
              />
              {fieldErrors.supportingTextEn && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {fieldErrors.supportingTextEn}
                </p>
              )}
            </div>

            {/* CTA Buttons EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="primaryCtaTextEn" className="block text-xs font-bold text-slate-700">
                  Primary Action Button (EN)
                </label>
                <input
                  id="primaryCtaTextEn"
                  type="text"
                  value={formData.primaryCtaTextEn}
                  onChange={(e) => handleChange('primaryCtaTextEn', e.target.value)}
                  placeholder="e.g., Explore Products"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
                {fieldErrors.primaryCtaTextEn && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {fieldErrors.primaryCtaTextEn}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="secondaryCtaTextEn" className="block text-xs font-bold text-slate-700">
                  Secondary Action Button (EN)
                </label>
                <input
                  id="secondaryCtaTextEn"
                  type="text"
                  value={formData.secondaryCtaTextEn}
                  onChange={(e) => handleChange('secondaryCtaTextEn', e.target.value)}
                  placeholder="e.g., Corporate Profile & Vision"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
                {fieldErrors.secondaryCtaTextEn && (
                  <p className="text-[11px] text-rose-600 font-medium">
                    {fieldErrors.secondaryCtaTextEn}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Arabic Content Section */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <h3 className="font-heading text-sm font-bold text-brand-navy">
                  Arabic Public Copy (RTL — /ar)
                </h3>
              </div>
              <Badge variant="cyan" size="sm">
                AR Locale (عربي)
              </Badge>
            </div>

            {/* Badge AR */}
            <div className="space-y-1 text-right" dir="rtl">
              <label htmlFor="badgeAr" className="block text-xs font-bold text-slate-700">
                شارة الهيدر (عربي)
              </label>
              <input
                id="badgeAr"
                type="text"
                dir="rtl"
                value={formData.badgeAr}
                onChange={(e) => handleChange('badgeAr', e.target.value)}
                placeholder="ميراج فارما • Healthy Life • تأسست عام 2019"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-right"
              />
              {fieldErrors.badgeAr && (
                <p className="text-[11px] text-rose-600 font-medium text-right">
                  {fieldErrors.badgeAr}
                </p>
              )}
            </div>

            {/* Headline Prefix + Highlight AR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right" dir="rtl">
              <div className="space-y-1">
                <label htmlFor="headlinePrefixAr" className="block text-xs font-bold text-slate-700">
                  بداية العنوان الرئيسي (عربي)
                </label>
                <input
                  id="headlinePrefixAr"
                  type="text"
                  dir="rtl"
                  value={formData.headlinePrefixAr}
                  onChange={(e) => handleChange('headlinePrefixAr', e.target.value)}
                  placeholder="رؤية جديدة.. عصر جديد في"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-right"
                />
                {fieldErrors.headlinePrefixAr && (
                  <p className="text-[11px] text-rose-600 font-medium text-right">
                    {fieldErrors.headlinePrefixAr}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="headlineHighlightAr" className="block text-xs font-bold text-slate-700">
                  العنوان الملوّن المميز (عربي)
                </label>
                <input
                  id="headlineHighlightAr"
                  type="text"
                  dir="rtl"
                  value={formData.headlineHighlightAr}
                  onChange={(e) => handleChange('headlineHighlightAr', e.target.value)}
                  placeholder="المكملات الغذائية وصناعة الدواء"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-right font-semibold text-brand-primary"
                />
                {fieldErrors.headlineHighlightAr && (
                  <p className="text-[11px] text-rose-600 font-medium text-right">
                    {fieldErrors.headlineHighlightAr}
                  </p>
                )}
              </div>
            </div>

            {/* Supporting Text AR */}
            <div className="space-y-1 text-right" dir="rtl">
              <label htmlFor="supportingTextAr" className="block text-xs font-bold text-slate-700">
                النص التعريفي والرسالة المؤسسية (عربي)
              </label>
              <textarea
                id="supportingTextAr"
                rows={3}
                dir="rtl"
                value={formData.supportingTextAr}
                onChange={(e) => handleChange('supportingTextAr', e.target.value)}
                placeholder="انطلقت شركة ميراج فارما في عام 2019..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary leading-relaxed text-right"
              />
              {fieldErrors.supportingTextAr && (
                <p className="text-[11px] text-rose-600 font-medium text-right">
                  {fieldErrors.supportingTextAr}
                </p>
              )}
            </div>

            {/* CTA Buttons AR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right" dir="rtl">
              <div className="space-y-1">
                <label htmlFor="primaryCtaTextAr" className="block text-xs font-bold text-slate-700">
                  زر الإجراء الرئيسي (عربي)
                </label>
                <input
                  id="primaryCtaTextAr"
                  type="text"
                  dir="rtl"
                  value={formData.primaryCtaTextAr}
                  onChange={(e) => handleChange('primaryCtaTextAr', e.target.value)}
                  placeholder="استكشف المستحضرات الدوائية"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-right"
                />
                {fieldErrors.primaryCtaTextAr && (
                  <p className="text-[11px] text-rose-600 font-medium text-right">
                    {fieldErrors.primaryCtaTextAr}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="secondaryCtaTextAr" className="block text-xs font-bold text-slate-700">
                  زر الإجراء الثانوي (عربي)
                </label>
                <input
                  id="secondaryCtaTextAr"
                  type="text"
                  dir="rtl"
                  value={formData.secondaryCtaTextAr}
                  onChange={(e) => handleChange('secondaryCtaTextAr', e.target.value)}
                  placeholder="عن الشركة ورؤيتنا"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-right"
                />
                {fieldErrors.secondaryCtaTextAr && (
                  <p className="text-[11px] text-rose-600 font-medium text-right">
                    {fieldErrors.secondaryCtaTextAr}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isPending}
              className="text-slate-600 hover:text-slate-900 border-slate-300"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Reset to Defaults
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isPending}
              className="px-6 shadow-md shadow-brand-primary/20 font-bold"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving & Revalidating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Durable Storage
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-cyan-light" />
              <span className="text-xs font-bold tracking-wide uppercase">
                Real-Time Public Preview
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setPreviewLocale('en')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                  previewLocale === 'en'
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English (/)
              </button>
              <button
                type="button"
                onClick={() => setPreviewLocale('ar')}
                className={`px-2.5 py-1 rounded-lg transition-colors font-semibold ${
                  previewLocale === 'ar'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                العربية (/ar)
              </button>
            </div>
          </div>

          {/* Rendered Preview Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border border-slate-200 bg-gradient-to-b from-blue-50/70 via-white to-white shadow-lg space-y-5 ${
              previewLocale === 'ar' ? 'text-right' : 'text-left'
            }`}
            dir={previewLocale === 'ar' ? 'rtl' : 'ltr'}
          >
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[11px] font-semibold`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {previewLocale === 'ar'
                  ? formData.badgeAr || DEFAULT_HOMEPAGE_HERO_CONTENT.badgeAr
                  : formData.badgeEn || DEFAULT_HOMEPAGE_HERO_CONTENT.badgeEn}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight leading-tight">
              {previewLocale === 'ar' ? (
                <>
                  {formData.headlinePrefixAr || DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixAr} <br />
                  <span className="text-brand-primary">
                    {formData.headlineHighlightAr ||
                      DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightAr}
                  </span>
                </>
              ) : (
                <>
                  {formData.headlinePrefixEn || DEFAULT_HOMEPAGE_HERO_CONTENT.headlinePrefixEn} <br />
                  <span className="text-brand-primary">
                    {formData.headlineHighlightEn ||
                      DEFAULT_HOMEPAGE_HERO_CONTENT.headlineHighlightEn}
                  </span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {previewLocale === 'ar'
                ? formData.supportingTextAr || DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextAr
                : formData.supportingTextEn || DEFAULT_HOMEPAGE_HERO_CONTENT.supportingTextEn}
            </p>

            <div
              className={`flex flex-wrap items-center gap-3 pt-2 ${
                previewLocale === 'ar' ? 'justify-start' : 'justify-start'
              }`}
            >
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <span>
                  {previewLocale === 'ar'
                    ? formData.primaryCtaTextAr || DEFAULT_HOMEPAGE_HERO_CONTENT.primaryCtaTextAr
                    : formData.primaryCtaTextEn || DEFAULT_HOMEPAGE_HERO_CONTENT.primaryCtaTextEn}
                </span>
                {previewLocale === 'ar' ? (
                  <ArrowLeft className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                {previewLocale === 'ar'
                  ? formData.secondaryCtaTextAr ||
                    DEFAULT_HOMEPAGE_HERO_CONTENT.secondaryCtaTextAr
                  : formData.secondaryCtaTextEn ||
                    DEFAULT_HOMEPAGE_HERO_CONTENT.secondaryCtaTextEn}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Path: {previewLocale === 'ar' ? '/ar' : '/'}</span>
              <span>Framework: Next.js SSR / ISR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
