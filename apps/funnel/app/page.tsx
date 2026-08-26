import Image from 'next/image';
import { getCurrentBrand } from '@/lib/brand';
import DevBrandSwitcher from '@/components/dev/dev-brand-switcher';
import ClickTracker from '@/components/tracking/click-tracker';
import DynamicForm, { FormSchema } from '@/components/forms/dynamic-form';

export const revalidate = 0; // Disable static caching for local dev brand switching

export default async function HomePage() {
  const brand = await getCurrentBrand();

  if (!brand) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <DevBrandSwitcher currentSlug="unknown" />

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel !bg-slate-900/90 !border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Brand Not Found</h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              No active brand is associated with this domain or requested dev override slug.
            </p>
            <div className="p-4 bg-slate-950/60 rounded-lg text-left text-xs font-mono text-slate-300 border border-slate-800 mb-6">
              <div><span className="text-slate-500">Status:</span> 404 Unresolved</div>
              <div><span className="text-slate-500">Suggested Action:</span> Use the dev override bar above to select a seed brand.</div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { theme_config } = brand;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      {/* Click Tracking Beacon */}
      <ClickTracker brandId={brand.id} />

      {/* Dev Brand Switcher Bar */}
      <DevBrandSwitcher currentSlug={brand.slug} />

      {/* Brand Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme_config.logo_url ? (
              <Image
                src={theme_config.logo_url}
                alt={`${brand.name} logo`}
                width={180}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            ) : (
              <div
                className="px-4 py-2 rounded-lg text-white font-extrabold text-lg shadow-sm"
                style={{ backgroundColor: theme_config.primary_color }}
              >
                {brand.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 uppercase tracking-wider">
              {brand.vertical.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      {/* Hero & Form Section */}
      <section className="relative overflow-hidden py-12 md:py-16 px-6 bg-gradient-to-b from-white to-slate-100 border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center relative z-10 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 bg-slate-100 text-slate-800 border border-slate-200">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: theme_config.primary_color }}
            />
            {brand.sub_vertical || brand.vertical}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4">
            {theme_config.headline}
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong className="text-slate-900">{brand.name}</strong>. Complete the quick form below to get instant quotes & assistance.
          </p>
        </div>

        {/* Dynamic Brand Form Renderer */}
        <DynamicForm
          brandId={brand.id}
          formSchema={brand.form_schema as unknown as FormSchema}
          themeConfig={theme_config}
        />
      </section>

      {/* Active Brand Metadata Inspection Card */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Resolved Brand Metadata (Supabase Record)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Brand ID</div>
              <div className="text-sm font-mono text-slate-800 truncate">{brand.id}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Slug / Domain</div>
              <div className="text-sm font-mono text-slate-800">{brand.slug} ({brand.domain})</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
