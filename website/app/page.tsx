import { getCurrentBrand } from '@/lib/brand';
import DevBrandSwitcher from '@/components/dev/dev-brand-switcher';
import ClickTracker from '@/components/tracking/click-tracker';
import DynamicForm, { FormSchema } from '@/components/forms/dynamic-form';
import BrandLogo from '@/components/branding/brand-logo';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable static caching for dynamic multi-brand resolution

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
    <main
      className="min-h-[100dvh] flex flex-col relative overflow-x-hidden bg-slate-950 text-slate-100 bg-cover bg-center bg-no-repeat"
      style={
        theme_config.background_image_url
          ? { backgroundImage: `url(${theme_config.background_image_url})` }
          : { background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)` }
      }
    >
      {/* Click Tracking Beacon */}
      <ClickTracker brandId={brand.id} />

      {/* Dev Brand Switcher Bar (Dev-only) */}
      <DevBrandSwitcher currentSlug={brand.slug} />

      {/* Full-bleed ambient dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70 backdrop-blur-[1px] pointer-events-none" />

      {/* Transparent / Glassmorphic Header */}
      <header className="w-full relative z-20 pt-[max(env(safe-area-inset-top),0.5rem)] pb-1 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo
              logoUrl={theme_config.logo_url}
              brandName={brand.name}
              primaryColor={theme_config.primary_color}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/10 backdrop-blur-md text-white/90 text-[10px] sm:text-xs font-semibold rounded-full border border-white/20 uppercase tracking-wider shadow-xs">
              {brand.vertical.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      {/* Centered Glassmorphic Form Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 px-3 sm:px-6 py-2 sm:py-5 max-w-5xl mx-auto w-full">
        {/* Dynamic Brand Form Renderer */}
        <div className="w-full">
          <DynamicForm
            brandId={brand.id}
            formSchema={brand.form_schema as unknown as FormSchema}
            themeConfig={theme_config}
          />
        </div>
      </div>
    </main>
  );
}
