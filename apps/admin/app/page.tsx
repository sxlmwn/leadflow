import { supabase } from '@/lib/supabase/client';

export const revalidate = 0;

export default async function AdminHomePage() {
  const { data: brands, error } = await supabase
    .from('brands')
    .select('id, name, slug, domain, is_active')
    .order('name');

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="border-b border-slate-800 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            LeadFlow Admin Scaffold
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Central Management Dashboard connected to Supabase (`aovlzjmeqtuvdqhgjjxy`).
          </p>
        </div>
      </header>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-lg font-bold text-slate-200 mb-4">
          Supabase Brand Connection Status
        </h2>
        {error ? (
          <div className="p-4 bg-red-950/50 text-red-300 rounded-xl border border-red-900 text-sm">
            Connection Error: {error.message}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-slate-400">
              Active Brands Found: <strong className="text-white">{brands?.length || 0}</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {brands?.map((b) => (
                <div key={b.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white text-base">{b.name}</div>
                  <div className="text-xs font-mono text-slate-400 mt-1">{b.slug}</div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                    <span>{b.domain}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 text-center">
        Base Admin Scaffold Ready. Features will be implemented in Step 6.
      </div>
    </main>
  );
}
