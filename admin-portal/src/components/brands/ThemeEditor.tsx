'use client';

import React, { useState } from 'react';
import { Palette, Type, Image as ImageIcon, Shield, Save, Check, Eye, AlertTriangle } from 'lucide-react';
import { AdminBrand } from '@/lib/data';

function isProxyOrFragileImageUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase().trim();
  return (
    lower.includes('external-content.duckduckgo.com') ||
    lower.includes('duckduckgo.com/iu') ||
    lower.includes('google.com/imgres') ||
    lower.includes('encrypted-tbn') ||
    lower.includes('tse1.mm.bing.net') ||
    lower.includes('bing.com/th') ||
    lower.includes('images.search.yahoo.com')
  );
}

interface ThemeEditorProps {
  brand: AdminBrand;
  onSave?: (
    themeConfig: Record<string, string>,
    legalCopy: Record<string, string>
  ) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ brand, onSave }) => {
  const [primaryColor, setPrimaryColor] = useState(
    brand.theme_config?.primary_color || '#18181b'
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
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    brand.theme_config?.background_image_url || ''
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
      {
        primary_color: primaryColor,
        font_style: fontStyle,
        logo_url: logoUrl,
        headline,
        background_image_url: backgroundImageUrl,
      },
      { disclaimer, tcpa_text: tcpaText, privacy_url: privacyUrl, terms_url: termsUrl }
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Editor Controls (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="admin-card p-6 space-y-6 transform-gpu">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground font-heading">Theme &amp; Branding Config</h3>
              <p className="text-xs text-muted-foreground font-medium">Customize colors, typography, and logo</p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 font-semibold rounded-xl text-xs shadow-xs transition-all duration-200 cursor-pointer"
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
            <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-foreground" />
              <span>Primary Accent Color</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="px-3 py-2 bg-card border border-border rounded-xl text-xs font-mono font-bold text-foreground outline-none focus:border-foreground"
              />
              <div className="flex items-center gap-1.5 ml-2">
                {['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPrimaryColor(c)}
                    className="w-6 h-6 rounded-full border border-border transition-transform hover:scale-110 cursor-pointer shadow-2xs"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-foreground" />
              <span>Font Family</span>
            </label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-foreground cursor-pointer"
            >
              <option value="Inter, sans-serif">Inter (Modern Clean Sans)</option>
              <option value="Outfit, sans-serif">Outfit (Display Heading Sans)</option>
              <option value="Roboto, sans-serif">Roboto (Formal Technical Sans)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Funnel Hero Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-foreground" />
              <span>Logo Asset URL</span>
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-foreground"
            />
            {isProxyOrFragileImageUrl(logoUrl) && (
              <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold">Search Engine Proxy URL Detected</p>
                  <p className="mt-0.5 text-amber-900/90 dark:text-amber-200/90 leading-normal">
                    Search proxy URLs (such as DuckDuckGo or Google image search links) are temporary and can expire. We recommend using a permanent direct URL (e.g. from Supabase Storage or an asset link ending in .png, .svg, .jpg).
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-foreground" />
              <span>Background Image URL (Optional)</span>
            </label>
            <input
              type="text"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-medium text-foreground outline-none focus:border-foreground"
            />
            {isProxyOrFragileImageUrl(backgroundImageUrl) && (
              <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-bold">Search Engine Proxy URL Detected</p>
                  <p className="mt-0.5 text-amber-900/90 dark:text-amber-200/90 leading-normal">
                    Search proxy URLs can expire over time. We recommend using a permanent direct image URL or Unsplash CDN link.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="admin-card p-6 space-y-4 transform-gpu">
          <h3 className="text-sm font-bold text-foreground font-heading flex items-center gap-2 border-b border-border pb-3">
            <Shield className="w-4 h-4 text-foreground" />
            <span>Legal Copy &amp; TCPA Compliance</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              TCPA Consent Disclosure
            </label>
            <textarea
              rows={2}
              value={tcpaText}
              onChange={(e) => setTcpaText(e.target.value)}
              className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              General Disclaimer Notice
            </label>
            <textarea
              rows={2}
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
              className="w-full px-3.5 py-2 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Privacy Policy URL
              </label>
              <input
                type="text"
                value={privacyUrl}
                onChange={(e) => setPrivacyUrl(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Terms of Service URL
              </label>
              <input
                type="text"
                value={termsUrl}
                onChange={(e) => setTermsUrl(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-24 admin-card p-6 border border-border bg-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-foreground" />
              <h4 className="text-sm font-bold text-foreground font-heading">Landing Hero Preview</h4>
            </div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              {brand.domain}
            </span>
          </div>

          <div
            className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl overflow-hidden relative border border-slate-800 bg-cover bg-center"
            style={{
              fontFamily: fontStyle,
              backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
            }}
          >
            {backgroundImageUrl && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
            )}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {brand.name[0]}
                  </div>
                  <span className="font-bold text-sm tracking-tight">{brand.name}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground bg-secondary px-2 py-0.5 rounded-full border border-border">
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
                className="w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all duration-200 cursor-pointer mb-4 hover:opacity-90"
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
    </div>
  );
};
