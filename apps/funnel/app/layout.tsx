import type { Metadata } from 'next';
import './globals.css';
import { getCurrentBrand } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getCurrentBrand();
  if (!brand) {
    return {
      title: 'Brand Not Found | LeadFlow',
      description: 'The requested brand domain is not registered on LeadFlow.',
    };
  }
  return {
    title: `${brand.name} | Official Site`,
    description: brand.theme_config.headline || `${brand.name} Lead Generation`,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = await getCurrentBrand();

  const themeVariables = brand
    ? ({
        '--primary-color': brand.theme_config.primary_color,
        '--brand-font': brand.theme_config.font_style,
      } as React.CSSProperties)
    : {};

  return (
    <html lang="en" style={themeVariables}>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
