'use client';

import React, { useState } from 'react';
import { Palette, Type, Image as ImageIcon, Shield, Save, Check, Eye } from 'lucide-react';
import { AdminBrand } from '@/lib/data';

interface ThemeEditorProps {
  brand: AdminBrand;
  onSave?: (
    themeConfig: Record<string, string>,
    legalCopy: Record<string, string>
  ) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ brand, onSave }) => {
  const [primaryColor, setPrimaryColor] = useState(
    brand.theme_config?.primary_color || '#2563eb'
  );
  const [fontStyle, setFontStyle] = useState(
    brand.theme_config?.font_style || 'Inter, sans-serif'
  );
  const [logoUrl, setLogoUrl] = useState(
    brand.theme_config?.logo_url || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=120&auto=format&fit=crop&q=80'
  );
  const [headline, setHeadline] = useState(
    brand.theme_config?.headline || 'Find Top-Rated Experts Near You'
  );

  const [disclaimer, setDisclaimer] = useState(
    (brand.legal_copy?.disclaimer as string) ||
      'By clicking Submit, you agree to receive calls and text messages from installation pros.'
  );
  const [tcpaText, setTcpaText] = useState(
    (brand.legal_copy?.tcpa_text as string) ||
      'I consent to automated marketing calls and emails.'
  );
  const [privacyUrl, setPrivacyUrl] = useState(
    (brand.legal_copy?.privacy_url as string) || `https://${brand.domain}/privacy`
  );
  const [termsUrl, setTermsUrl] = useState(
    (brand.legal_copy?.terms_url as string) || `https://${brand.domain}/terms`
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSave?.(
      { primary_color: primaryColor, font_style: fontStyle, logo_url: logoUrl, headline },
      { disclaimer, tcpa_text: tcpaText, privacy_url: privacyUrl, terms_url: termsUrl }
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Editor Controls (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="admin-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">Theme &amp; Branding Config</h3>
              <p className="text-xs text-slate-400 font-medium">Customize colors, typography, and logo</p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Theme</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Primary Accent Color</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
              <div className="flex items-center gap-1.5 ml-2">
                {['#2563eb', '#0d9488', '#16a34a', '#7c3aed', '#e11d48'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPrimaryColor(c)}
                    className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Font Family</span>
            </label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Inter, sans-serif">Inter (Modern Clean Sans)</option>
              <option value="Outfit, sans-serif">Outfit (Display Heading Sans)</option>
              <option value="Roboto, sans-serif">Roboto (Formal Technical Sans)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Funnel Hero Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Logo Asset URL</span>
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="admin-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Legal Copy &amp; TCPA Compliance</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              TCPA Consent Disclosure
            </label>
            <textarea
              rows={2}
              value={tcpaText}
              onChange={(e) => setTcpaText(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              General Disclaimer Notice
            </label>
            <textarea
              rows={2}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Privacy Policy URL
              </label>
              <input
                type="text"
                value={privacyUrl}
                onChange={(e) => setPrivacyUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Terms of Service URL
              </label>
              <input
                type="text"
                value={termsUrl}
                onChange={(e) => setTermsUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-24 admin-card p-6 border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">Landing Hero Preview</h4>
            </div>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {brand.domain}
            </span>
          </div>

          <div
            className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl overflow-hidden relative"
            style={{ fontFamily: fontStyle }}
          >
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {brand.name[0]}
                </div>
                <span className="font-bold text-sm tracking-tight">{brand.name}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                Live Preview
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <h1 className="text-xl font-extrabold leading-tight tracking-tight">
                {headline}
              </h1>
              <p className="text-xs text-slate-300">
                Get matched with verified professionals in 30 seconds.
              </p>
            </div>

            <button
              className="w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer mb-4"
              style={{ backgroundColor: primaryColor }}
            >
              Start Free Assessment →
            </button>

            <div className="text-[9px] text-slate-400 leading-tight border-t border-slate-800/80 pt-3">
              <p className="mb-1">{tcpaText}</p>
              <div className="flex gap-2 text-slate-500 font-medium">
                <span>Privacy</span>
                <span>•</span>
                <span>Terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
