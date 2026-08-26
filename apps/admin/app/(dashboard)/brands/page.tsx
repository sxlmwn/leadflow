'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Plus,
  Layers,
  Edit,
  Sparkles,
  Eye,
  Trash2,
  Palette,
  FileCode2,
} from 'lucide-react';

interface BrandItem {
  id: string;
  slug: string;
  name: string;
  domain: string;
  vertical: string;
  sub_vertical: string | null;
  theme_config: {
    primary_color?: string;
    logo_url?: string;
    font_style?: string;
    headline?: string;
  };
  form_schema: FormSchema;
  legal_copy: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  leadCount?: number;
}

interface FormFieldOption {
  label: string;
  value: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'zip_code' | 'radio' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
}

interface FormStep {
  step_id: string;
  title: string;
  fields: FormField[];
}

interface FormSchema {
  title?: string;
  description?: string;
  steps?: FormStep[];
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Tab state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'theme' | 'builder'>('details');
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State for Details & Theme
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [vertical, setVertical] = useState('');
  const [subVertical, setSubVertical] = useState('');
  const [legalCopy, setLegalCopy] = useState('');

  // Theme state
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [fontStyle, setFontStyle] = useState('Inter, sans-serif');
  const [logoUrl, setLogoUrl] = useState('');
  const [headline, setHeadline] = useState('');

  // Form Builder state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSteps, setFormSteps] = useState<FormStep[]>([]);
  const [previewStepIndex, setPreviewStepIndex] = useState(0);

  // Fetch Brands and lead counts
  useEffect(() => {
    let isMounted = true;

    async function loadBrands() {
      try {
        const { data: brandsData } = await supabase.from('brands').select('*').order('name');
        const { data: leadsData } = await supabase.from('leads').select('brand_id');

        if (!isMounted) return;

        const leadCounts: Record<string, number> = {};
        (leadsData || []).forEach((l) => {
          leadCounts[l.brand_id] = (leadCounts[l.brand_id] || 0) + 1;
        });

        const processed = (brandsData || []).map((b) => ({
          ...b,
          leadCount: leadCounts[b.id] || 0,
        }));

        setBrands(processed as BrandItem[]);
      } catch (err) {
        console.error('Error fetching brands:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, []);

  // Open Edit / Create Dialog
  const handleOpenEdit = (brand?: BrandItem) => {
    if (brand) {
      setEditingBrand(brand);
      setName(brand.name);
      setSlug(brand.slug);
      setDomain(brand.domain);
      setVertical(brand.vertical);
      setSubVertical(brand.sub_vertical || '');
      setLegalCopy(JSON.stringify(brand.legal_copy || {}, null, 2));

      setPrimaryColor(brand.theme_config?.primary_color || '#2563eb');
      setFontStyle(brand.theme_config?.font_style || 'Inter, sans-serif');
      setLogoUrl(brand.theme_config?.logo_url || '');
      setHeadline(brand.theme_config?.headline || '');

      setFormTitle(brand.form_schema?.title || 'Get Your Free Quote');
      setFormDescription(brand.form_schema?.description || 'Complete this short form.');
      setFormSteps(brand.form_schema?.steps || []);
    } else {
      setEditingBrand(null);
      setName('');
      setSlug('');
      setDomain('');
      setVertical('home_improvement');
      setSubVertical('');
      setLegalCopy('{}');

      setPrimaryColor('#2563eb');
      setFontStyle('Inter, sans-serif');
      setLogoUrl('/brands/windowhound-logo.svg');
      setHeadline('Find Top Experts Near You');

      setFormTitle('Get Your Free Quote');
      setFormDescription('Complete this form to get instant quotes.');
      setFormSteps([
        {
          step_id: 'step_1',
          title: 'Project Details',
          fields: [
            {
              name: 'project_type',
              label: 'What is the scope of your project?',
              type: 'radio',
              required: true,
              options: [
                { label: 'Replace Existing', value: 'replace' },
                { label: 'New Installation', value: 'new' },
              ],
            },
          ],
        },
      ]);
    }
    setActiveTab('details');
    setPreviewStepIndex(0);
    setDialogOpen(true);
  };

  // Form Builder Handlers
  const addStep = () => {
    const newStepId = `step_${formSteps.length + 1}`;
    setFormSteps([
      ...formSteps,
      {
        step_id: newStepId,
        title: `Step ${formSteps.length + 1} Title`,
        fields: [],
      },
    ]);
  };

  const removeStep = (stepIdx: number) => {
    setFormSteps(formSteps.filter((_, idx) => idx !== stepIdx));
  };

  const addField = (stepIdx: number) => {
    const updated = [...formSteps];
    const newFieldName = `field_${Date.now()}`;
    updated[stepIdx].fields.push({
      name: newFieldName,
      label: 'New Question Label',
      type: 'text',
      required: true,
      placeholder: 'Enter answer...',
    });
    setFormSteps(updated);
  };

  const removeField = (stepIdx: number, fieldIdx: number) => {
    const updated = [...formSteps];
    updated[stepIdx].fields = updated[stepIdx].fields.filter((_, idx) => idx !== fieldIdx);
    setFormSteps(updated);
  };

  const updateField = (stepIdx: number, fieldIdx: number, key: keyof FormField, value: unknown) => {
    const updated = [...formSteps];
    updated[stepIdx].fields[fieldIdx] = {
      ...updated[stepIdx].fields[fieldIdx],
      [key]: value,
    };
    setFormSteps(updated);
  };

  const addFieldOption = (stepIdx: number, fieldIdx: number) => {
    const updated = [...formSteps];
    const field = updated[stepIdx].fields[fieldIdx];
    const currentOptions = field.options || [];
    field.options = [
      ...currentOptions,
      { label: `Option ${currentOptions.length + 1}`, value: `opt_${currentOptions.length + 1}` },
    ];
    setFormSteps(updated);
  };

  const updateFieldOption = (
    stepIdx: number,
    fieldIdx: number,
    optIdx: number,
    key: 'label' | 'value',
    value: string
  ) => {
    const updated = [...formSteps];
    const opts = [...(updated[stepIdx].fields[fieldIdx].options || [])];
    opts[optIdx] = { ...opts[optIdx], [key]: value };
    updated[stepIdx].fields[fieldIdx].options = opts;
    setFormSteps(updated);
  };

  // Save Brand
  const handleSave = async () => {
    setSaving(true);
    try {
      let parsedLegal = {};
      try { parsedLegal = JSON.parse(legalCopy); } catch {}

      const constructedSchema: FormSchema = {
        title: formTitle,
        description: formDescription,
        steps: formSteps,
      };

      const themeConfig = {
        primary_color: primaryColor,
        font_style: fontStyle,
        logo_url: logoUrl,
        headline: headline,
      };

      if (editingBrand) {
        await supabase
          .from('brands')
          .update({
            name,
            slug,
            domain,
            vertical,
            sub_vertical: subVertical || null,
            legal_copy: parsedLegal,
            theme_config: themeConfig,
            form_schema: constructedSchema as unknown as Record<string, unknown>,
          })
          .eq('id', editingBrand.id);
      } else {
        await supabase.from('brands').insert({
          name,
          slug,
          domain,
          vertical,
          sub_vertical: subVertical || null,
          legal_copy: parsedLegal,
          theme_config: themeConfig,
          form_schema: constructedSchema as unknown as Record<string, unknown>,
        });
      }

      setDialogOpen(false);
      const { data: refreshed } = await supabase.from('brands').select('*').order('name');
      setBrands((refreshed || []) as BrandItem[]);
    } catch (err) {
      console.error('Error saving brand:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Brand Portfolios & No-Code Form Builder
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Configure multi-brand landing pages, visual themes, and multi-step form questions.
          </p>
        </div>
        <Button onClick={() => handleOpenEdit()} className="rounded-full font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add Brand Portfolio
        </Button>
      </div>

      {/* Brands Directory Grid / Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white">Configured White-Label Brands</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">Live domains and visual styling</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="text-xs font-bold text-slate-400">Brand Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Domain</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Vertical</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Primary Theme Color</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Leads Generated</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Status</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No brands configured. Click &quot;Add Brand Portfolio&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span>{brand.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-900 dark:text-slate-100 font-semibold">
                      {brand.domain}
                    </TableCell>
                    <TableCell className="capitalize text-xs text-slate-500">
                      {brand.vertical.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs"
                          style={{ backgroundColor: brand.theme_config?.primary_color || '#2563eb' }}
                        />
                        <span className="font-mono text-xs">{brand.theme_config?.primary_color || '#2563eb'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {brand.leadCount || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(brand)} className="rounded-full text-xs">
                        <Edit className="w-3.5 h-3.5 mr-1" /> Edit / Form Builder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Comprehensive Brand Editor & Form Builder Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] rounded-3xl p-6 shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setDialogOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-extrabold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Create Brand Portfolio'}
                </h2>
                <p className="text-xs text-slate-400">Configure details, visual design system, and multi-step questions.</p>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  activeTab === 'details'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                1. Details & Domain
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'theme'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Palette className="w-3.5 h-3.5" /> 2. Visual Theme & Hero
              </button>
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'builder'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" /> 3. No-Code Form Builder
              </button>
            </div>

            {/* TAB 1: DETAILS */}
            {activeTab === 'details' && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Brand Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. WindowHound"
                      className="w-full h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">URL Slug</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="windowhound"
                      className="w-full h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Domain Name</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="windowhound.com"
                      className="w-full h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Vertical Category</label>
                    <input
                      type="text"
                      value={vertical}
                      onChange={(e) => setVertical(e.target.value)}
                      placeholder="home_improvement"
                      className="w-full h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Legal Compliance Copy (JSON)</label>
                  <textarea
                    rows={4}
                    value={legalCopy}
                    onChange={(e) => setLegalCopy(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: THEME & LIVE PREVIEW */}
            {activeTab === 'theme' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 pr-2 text-xs">
                {/* Theme Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Primary Theme Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-2xl cursor-pointer bg-transparent border-none"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Typography Font Family</label>
                    <select
                      value={fontStyle}
                      onChange={(e) => setFontStyle(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-xs"
                    >
                      <option value="Inter, sans-serif">Inter (Modern & Clean)</option>
                      <option value="Outfit, sans-serif">Outfit (Bold & Geometric)</option>
                      <option value="Roboto, sans-serif">Roboto (Technical & Crisp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Logo SVG / Image URL</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="/brands/windowhound-logo.svg"
                      className="w-full h-10 px-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Landing Hero Headline</label>
                    <textarea
                      rows={3}
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Find Top Experts Near You"
                      className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Live Theme Preview Panel */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-5 bg-slate-950 flex flex-col justify-between shadow-inner">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-400" /> Live Hero Preview
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 font-sans">
                    <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center font-bold text-white shadow-md" style={{ backgroundColor: primaryColor }}>
                      LH
                    </div>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {headline || 'Your Headline Will Appear Here'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sample description rendering with brand primary accent style.
                    </p>
                    <button
                      className="w-full py-2.5 rounded-full text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Get Started Now
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 text-center mt-3 font-mono">
                    Theme Engine Preview Mode
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NO-CODE FORM BUILDER */}
            {activeTab === 'builder' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 pr-2 text-xs">
                {/* Left: Step & Field Builder Controls */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Form Title</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Form Description</label>
                      <input
                        type="text"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Funnel Steps ({formSteps.length})</span>
                    <Button size="sm" onClick={addStep} className="h-7 text-[11px] rounded-full">
                      <Plus className="w-3 h-3 mr-1" /> Add Step
                    </Button>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-4">
                    {formSteps.map((step, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => {
                              const updated = [...formSteps];
                              updated[sIdx].title = e.target.value;
                              setFormSteps(updated);
                            }}
                            className="font-bold text-xs bg-transparent border-b border-slate-300 dark:border-slate-700 focus:outline-none text-slate-900 dark:text-white"
                          />
                          <button onClick={() => removeStep(sIdx)} className="text-rose-500 hover:text-rose-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Fields List in Step */}
                        <div className="space-y-3 pt-2">
                          {step.fields.map((field, fIdx) => (
                            <div key={fIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  placeholder="Question Label"
                                  value={field.label}
                                  onChange={(e) => updateField(sIdx, fIdx, 'label', e.target.value)}
                                  className="w-full h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border-none font-semibold"
                                />
                                <button onClick={() => removeField(sIdx, fIdx)} className="text-rose-400">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">Input Type</label>
                                  <select
                                    value={field.type}
                                    onChange={(e) => updateField(sIdx, fIdx, 'type', e.target.value)}
                                    className="w-full h-7 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-[11px]"
                                  >
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="zip_code">Zip Code</option>
                                    <option value="radio">Radio Options</option>
                                    <option value="select">Dropdown Select</option>
                                    <option value="checkbox">Checkbox Group</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] text-slate-400 mb-0.5">Field Name (JSON key)</label>
                                  <input
                                    type="text"
                                    value={field.name}
                                    onChange={(e) => updateField(sIdx, fIdx, 'name', e.target.value)}
                                    className="w-full h-7 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none font-mono text-[11px]"
                                  />
                                </div>
                              </div>

                              {/* Editable Options for radio / select / checkbox */}
                              {['radio', 'select', 'checkbox'].includes(field.type) && (
                                <div className="space-y-1.5 pt-1">
                                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                                    <span>Choices / Options</span>
                                    <button onClick={() => addFieldOption(sIdx, fIdx)} className="text-slate-900 dark:text-white font-bold">
                                      + Option
                                    </button>
                                  </div>
                                  {(field.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        placeholder="Label"
                                        value={opt.label}
                                        onChange={(e) => updateFieldOption(sIdx, fIdx, oIdx, 'label', e.target.value)}
                                        className="h-6 px-2 text-[10px] rounded bg-slate-100 dark:bg-slate-800 border-none flex-1"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Value"
                                        value={opt.value}
                                        onChange={(e) => updateFieldOption(sIdx, fIdx, oIdx, 'value', e.target.value)}
                                        className="h-6 px-2 text-[10px] rounded bg-slate-100 dark:bg-slate-800 border-none font-mono flex-1"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          <Button variant="outline" size="sm" onClick={() => addField(sIdx)} className="w-full text-xs h-8 rounded-full">
                            + Add Question Field
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Live Interactive Form Preview Pane */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-5 bg-slate-950 flex flex-col justify-between shadow-inner">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-400" /> Interactive Funnel Preview</span>
                      {formSteps.length > 1 && (
                        <div className="flex gap-1">
                          {formSteps.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setPreviewStepIndex(idx)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                previewStepIndex === idx ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Step {idx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                      <h4 className="font-extrabold text-sm text-white">{formTitle}</h4>
                      <p className="text-xs text-slate-400">{formDescription}</p>

                      {formSteps[previewStepIndex] && (
                        <div className="space-y-4 pt-2 border-t border-slate-800">
                          <div className="text-xs font-bold text-slate-300">
                            {formSteps[previewStepIndex].title}
                          </div>
                          {formSteps[previewStepIndex].fields.map((f, i) => (
                            <div key={i} className="space-y-1.5">
                              <label className="block text-xs font-semibold text-slate-300">
                                {f.label} {f.required && <span className="text-rose-400">*</span>}
                              </label>
                              {f.type === 'radio' && (
                                <div className="space-y-1">
                                  {(f.options || []).map((o, optI) => (
                                    <label key={optI} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                                      <input type="radio" name={f.name} className="text-slate-100" />
                                      <span>{o.label}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {f.type === 'select' && (
                                <select className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                                  {(f.options || []).map((o, optI) => (
                                    <option key={optI}>{o.label}</option>
                                  ))}
                                </select>
                              )}
                              {['text', 'email', 'phone', 'zip_code'].includes(f.type) && (
                                <input
                                  type="text"
                                  placeholder={f.placeholder || 'Your answer...'}
                                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 text-center mt-3 font-mono">
                    DynamicForm Engine Structural Preview
                  </div>
                </div>
              </div>
            )}

            {/* Modal Save Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-full font-bold">
                {saving ? 'Saving Brand...' : 'Save Brand Portfolio'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
