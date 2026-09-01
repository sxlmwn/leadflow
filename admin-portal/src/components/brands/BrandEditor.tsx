'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Palette,
  Layers,
  Shield,
  Save,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Code2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Globe,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { Brand, FormField, FormSchema, FormStep, ThemeConfig, LegalCopy, FormFieldType } from '@/types';
import { DynamicFormPreview } from '@/components/forms/DynamicFormPreview';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';

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

interface BrandEditorProps {
  initialBrand?: Brand | null;
  mode: 'create' | 'edit';
}

const DEFAULT_VERTICALS = [
  { value: 'home_improvement', label: 'Home Improvement' },
  { value: 'paid_clinical_trials', label: 'Paid Clinical Trials' },
  { value: 'health_product', label: 'Health & Wellness' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal & Claims' },
  { value: 'financial_services', label: 'Financial Services' },
  { value: 'solar_energy', label: 'Solar Energy' },
  { value: 'roofing', label: 'Roofing & Siding' },
  { value: 'custom', label: 'Custom Vertical' },
];

const PRESET_COLORS = ['#2563eb', '#0d9488', '#16a34a', '#0284c7', '#d97706', '#dc2626', '#4f46e5', '#8b5cf6', '#ec4899'];

function parseColorAndOpacity(colorStr: string): { hex: string; opacity: number } {
  if (!colorStr) return { hex: '#2563eb', opacity: 100 };
  const str = colorStr.trim();
  
  if (str.startsWith('#') && str.length === 9) {
    const hex = str.slice(0, 7);
    const alphaHex = str.slice(7, 9);
    const alpha = parseInt(alphaHex, 16);
    const opacity = Math.round((alpha / 255) * 100);
    return { hex, opacity: isNaN(opacity) ? 100 : opacity };
  }
  
  if (str.startsWith('#') && str.length === 7) {
    return { hex: str, opacity: 100 };
  }

  if (str.startsWith('#') && str.length === 4) {
    const r = str[1];
    const g = str[2];
    const b = str[3];
    return { hex: `#${r}${r}${g}${g}${b}${b}`, opacity: 100 };
  }

  const rgbaMatch = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
    const hex = `#${r}${g}${b}`;
    const a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
    const opacity = Math.round(a * 100);
    return { hex, opacity: isNaN(opacity) ? 100 : opacity };
  }

  return { hex: str.startsWith('#') ? str.slice(0, 7) : '#2563eb', opacity: 100 };
}

function combineColorAndOpacity(hex: string, opacity: number): string {
  let cleanHex = hex.trim();
  if (!cleanHex.startsWith('#')) {
    cleanHex = `#${cleanHex}`;
  }
  if (cleanHex.length > 7) {
    cleanHex = cleanHex.slice(0, 7);
  }
  if (cleanHex.length < 7) {
    return cleanHex;
  }
  if (opacity >= 100) {
    return cleanHex;
  }
  const alphaVal = Math.round((Math.max(0, Math.min(100, opacity)) / 100) * 255);
  const alphaHex = alphaVal.toString(16).padStart(2, '0');
  return `${cleanHex}${alphaHex}`;
}

const DEFAULT_FONTS = [
  { value: 'Inter, sans-serif', label: 'Inter (Clean & Modern)' },
  { value: 'Outfit, sans-serif', label: 'Outfit (Display Heading)' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Formal Technical)' },
  { value: 'system-ui, sans-serif', label: 'System Default' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const BrandEditor: React.FC<BrandEditorProps> = ({
  initialBrand,
  mode
}) => {
  const router = useRouter();

  // Basic Info State
  const [name, setName] = useState(initialBrand?.name || '');
  const [slug, setSlug] = useState(initialBrand?.slug || '');
  const [domain, setDomain] = useState(initialBrand?.domain || '');
  const [vertical, setVertical] = useState(initialBrand?.vertical || 'home_improvement');
  const [subVertical, setSubVertical] = useState(initialBrand?.sub_vertical || '');
  const [isActive, setIsActive] = useState(initialBrand?.is_active ?? true);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(mode === 'edit');

  // Theme Config State
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(
    initialBrand?.theme_config || {
      primary_color: '#2563eb',
      secondary_color: '#3b82f6',
      bg_color: '#ffffff',
      logo_url: '',
      font_style: 'Inter, sans-serif',
      headline: 'Find Top-Rated Specialists Near You',
    }
  );

  // Form Schema State
  const [formSchema, setFormSchema] = useState<FormSchema>(() => {
    if (initialBrand?.form_schema && initialBrand.form_schema.steps) {
      return initialBrand.form_schema;
    }
    return {
      title: 'Get Your Free Quote',
      description: 'Complete this quick 30-second form to get matched with certified specialists.',
      steps: [
        {
          step_id: 'step_1',
          title: 'Project Information',
          fields: [
            {
              name: 'project_type',
              label: 'Project Type',
              type: 'radio',
              required: true,
              options: [
                { label: 'Full Replacement', value: 'replacement' },
                { label: 'Repair / Maintenance', value: 'repair' },
                { label: 'New Installation', value: 'new_install' },
              ],
            },
            {
              name: 'property_type',
              label: 'Property Type',
              type: 'select',
              required: true,
              options: [
                { label: 'Single Family Home', value: 'single_family' },
                { label: 'Townhouse / Condo', value: 'townhouse' },
                { label: 'Commercial Building', value: 'commercial' },
              ],
            },
          ],
        },
        {
          step_id: 'step_2',
          title: 'Contact Details',
          fields: [
            { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'e.g. Jane Smith', required: true },
            { name: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com', required: true },
            { name: 'phone', label: 'Phone Number', type: 'phone', placeholder: '(555) 000-0000', required: true },
            { name: 'zip_code', label: 'ZIP Code', type: 'zip_code', placeholder: '90210', required: true },
          ],
        },
      ],
    };
  });

  // Legal Copy State
  const [legalCopy, setLegalCopy] = useState<LegalCopy>(
    initialBrand?.legal_copy || {
      tcpa_text: 'By clicking Submit, I consent to receive automated marketing calls and text messages.',
      disclaimer: 'Participation is voluntary. Verified contractor estimates are provided without obligation.',
      privacy_url: 'https://example.com/privacy',
      terms_url: 'https://example.com/terms',
    }
  );

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState<'basic' | 'theme' | 'form' | 'legal'>('basic');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>({});

  // Raw JSON Modal
  const [isRawJsonModalOpen, setIsRawJsonModalOpen] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);

  // Validation and Status States
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-slugify from name in create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Validate Slug Uniqueness on debounce
  useEffect(() => {
    if (!slug) {
      setSlugError('Slug is required');
      return;
    }

    const timer = setTimeout(async () => {
      setSlugChecking(true);
      try {
        let query = supabase.from('brands').select('id').eq('slug', slug);
        if (mode === 'edit' && initialBrand?.id) {
          query = query.neq('id', initialBrand.id);
        }
        const { data } = await query;
        if (data && data.length > 0) {
          setSlugError('This slug is already taken by another brand');
        } else {
          setSlugError(null);
        }
      } catch (err) {
        console.error('Slug check error:', err);
      } finally {
        setSlugChecking(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, mode, initialBrand?.id]);

  // Form Builder Field Handlers
  const currentStep = formSchema.steps[activeStepIndex] || formSchema.steps[0];

  const addStep = () => {
    const newStepIndex = formSchema.steps.length + 1;
    const newStep: FormStep = {
      step_id: `step_${Date.now()}`,
      title: `Step ${newStepIndex}: Additional Info`,
      fields: [
        {
          name: `field_${Date.now()}`,
          label: 'New Question',
          type: 'text',
          required: true,
          placeholder: 'Enter response...',
        },
      ],
    };
    setFormSchema({ ...formSchema, steps: [...formSchema.steps, newStep] });
    setActiveStepIndex(formSchema.steps.length);
  };

  const removeStep = (stepIndex: number) => {
    if (formSchema.steps.length <= 1) {
      alert('A form must have at least one step.');
      return;
    }
    const nextSteps = formSchema.steps.filter((_, idx) => idx !== stepIndex);
    setFormSchema({ ...formSchema, steps: nextSteps });
    setActiveStepIndex(Math.max(0, stepIndex - 1));
  };

  const updateStepTitle = (stepIndex: number, title: string) => {
    const nextSteps = [...formSchema.steps];
    if (nextSteps[stepIndex]) {
      nextSteps[stepIndex] = { ...nextSteps[stepIndex], title };
      setFormSchema({ ...formSchema, steps: nextSteps });
    }
  };

  const addFieldToCurrentStep = (type: FormFieldType = 'text') => {
    const timestamp = Date.now();
    const isOptionType = type === 'radio' || type === 'select' || type === 'checkbox';

    const newField: FormField = {
      name: `field_${timestamp}`,
      label: `New ${type.replace('_', ' ').toUpperCase()} Field`,
      type,
      required: true,
      placeholder: type === 'phone' ? '(555) 000-0000' : type === 'zip_code' ? '90210' : 'Enter value...',
      options: isOptionType
        ? [
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
          ]
        : undefined,
    };

    const nextSteps = [...formSchema.steps];
    if (nextSteps[activeStepIndex]) {
      nextSteps[activeStepIndex] = {
        ...nextSteps[activeStepIndex],
        fields: [...nextSteps[activeStepIndex].fields, newField],
      };
      setFormSchema({ ...formSchema, steps: nextSteps });
      setExpandedFields((prev) => ({ ...prev, [newField.name]: true }));
    }
  };

  const updateFieldInCurrentStep = (fieldIndex: number, updatedField: Partial<FormField>) => {
    const nextSteps = [...formSchema.steps];
    if (nextSteps[activeStepIndex] && nextSteps[activeStepIndex].fields[fieldIndex]) {
      const old = nextSteps[activeStepIndex].fields[fieldIndex];
      const merged: FormField = { ...old, ...updatedField };

      // If type changed to option type and had no options, add defaults
      if (
        (merged.type === 'radio' || merged.type === 'select' || merged.type === 'checkbox') &&
        (!merged.options || merged.options.length === 0)
      ) {
        merged.options = [
          { label: 'Option 1', value: 'opt_1' },
          { label: 'Option 2', value: 'opt_2' },
        ];
      }

      nextSteps[activeStepIndex].fields[fieldIndex] = merged;
      setFormSchema({ ...formSchema, steps: nextSteps });
    }
  };

  const removeFieldFromCurrentStep = (fieldIndex: number) => {
    const nextSteps = [...formSchema.steps];
    if (nextSteps[activeStepIndex]) {
      nextSteps[activeStepIndex] = {
        ...nextSteps[activeStepIndex],
        fields: nextSteps[activeStepIndex].fields.filter((_, idx) => idx !== fieldIndex),
      };
      setFormSchema({ ...formSchema, steps: nextSteps });
    }
  };

  const moveField = (fieldIndex: number, direction: 'up' | 'down') => {
    const nextSteps = [...formSchema.steps];
    if (!nextSteps[activeStepIndex]) return;

    const fields = [...nextSteps[activeStepIndex].fields];
    const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;

    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const [moved] = fields.splice(fieldIndex, 1);
    fields.splice(targetIndex, 0, moved);

    nextSteps[activeStepIndex].fields = fields;
    setFormSchema({ ...formSchema, steps: nextSteps });
  };

  // Option sub-list helpers
  const addOptionToField = (fieldIndex: number) => {
    const field = currentStep?.fields[fieldIndex];
    if (!field) return;

    const currentOptions = field.options || [];
    const newOpt = {
      label: `Option ${currentOptions.length + 1}`,
      value: `option_${currentOptions.length + 1}`,
    };
    updateFieldInCurrentStep(fieldIndex, { options: [...currentOptions, newOpt] });
  };

  const updateOption = (fieldIndex: number, optIndex: number, key: 'label' | 'value', val: string) => {
    const field = currentStep?.fields[fieldIndex];
    if (!field || !field.options) return;

    const nextOptions = [...field.options];
    nextOptions[optIndex] = { ...nextOptions[optIndex], [key]: val };
    updateFieldInCurrentStep(fieldIndex, { options: nextOptions });
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const field = currentStep?.fields[fieldIndex];
    if (!field || !field.options) return;

    const nextOptions = field.options.filter((_, idx) => idx !== optIndex);
    updateFieldInCurrentStep(fieldIndex, { options: nextOptions });
  };

  // Raw JSON Handlers
  const openRawJsonEditor = () => {
    setRawJsonText(JSON.stringify(formSchema, null, 2));
    setRawJsonError(null);
    setIsRawJsonModalOpen(true);
  };

  const applyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        throw new Error('JSON must contain a "steps" array');
      }
      setFormSchema(parsed);
      setIsRawJsonModalOpen(false);
      setRawJsonError(null);
    } catch (err: any) {
      setRawJsonError(err.message || 'Invalid JSON format');
    }
  };

  // Validate entire brand before save
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!name.trim()) errors.push('Brand Name is required');
    if (!slug.trim()) errors.push('Brand Slug is required');
    if (slugError) errors.push(slugError);
    if (!domain.trim()) errors.push('Brand Domain is required');

    if (!formSchema.steps || formSchema.steps.length === 0) {
      errors.push('Form schema must have at least 1 step');
    } else {
      let totalFields = 0;
      formSchema.steps.forEach((step, sIdx) => {
        if (!step.title.trim()) errors.push(`Step ${sIdx + 1} is missing a title`);
        step.fields.forEach((field, fIdx) => {
          totalFields++;
          if (!field.label.trim()) errors.push(`Step ${sIdx + 1}, Field ${fIdx + 1} is missing a label`);
          if (!field.name.trim()) errors.push(`Step ${sIdx + 1}, Field ${fIdx + 1} is missing a field name`);
          if ((field.type === 'radio' || field.type === 'select') && (!field.options || field.options.length === 0)) {
            errors.push(`Field "${field.label}" requires at least one option`);
          }
        });
      });

      if (totalFields === 0) {
        errors.push('Form schema must contain at least one question field');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Save Brand to Supabase
  const handleSave = async (publish: boolean) => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    const brandPayload = {
      name: name.trim(),
      slug: slug.trim(),
      domain: domain.trim().toLowerCase(),
      vertical: vertical || 'home_improvement',
      sub_vertical: subVertical.trim() || null,
      theme_config: themeConfig,
      form_schema: formSchema,
      legal_copy: legalCopy,
      is_active: publish,
      updated_at: new Date().toISOString(),
    };

    try {
      if (mode === 'create') {
        const { error } = await supabase.from('brands').insert([brandPayload]);
        if (error) throw error;
      } else if (initialBrand?.id) {
        const { error } = await supabase.from('brands').update(brandPayload).eq('id', initialBrand.id);
        if (error) throw error;
      }

      setIsActive(publish);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        router.push('/brands');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      console.error('Save brand error:', err);
      setValidationErrors([err.message || 'Failed to save brand to database']);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/brands"
            className="w-9 h-9 rounded-xl bg-card hover:bg-secondary border border-border flex items-center justify-center text-foreground transition-all duration-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
                {mode === 'create' ? 'Create New Brand Funnel' : `Edit Brand: ${name || initialBrand?.name}`}
              </h2>
              <span
                className="w-3 h-3 rounded-full shadow-2xs inline-block"
                style={{ backgroundColor: themeConfig.primary_color }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Visual No-Code Builder for theme styling, step schemas, and legal disclosures
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(false)}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-secondary text-foreground text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader
                  size="sm"
                  title="Publishing..."
                  subtitle=""
                  className="p-0 gap-1.5 flex-row text-white dark:text-white [&_h1]:text-white [&_h1]:text-xs [&_div]:size-4"
                />
              </span>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved &amp; Published!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save &amp; Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Errors Notice Banner */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Please resolve the following before saving:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Wizard Tabs */}
      <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-2xl border border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('basic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeTab === 'basic' ? 'bg-blue-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Section A: Basic Info</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeTab === 'theme' ? 'bg-blue-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Section B: Theme &amp; Hero</span>
        </button>

        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeTab === 'form' ? 'bg-blue-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Section C: Form Schema Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
            activeTab === 'legal' ? 'bg-blue-600 text-white shadow-xs' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Section D: Legal Disclosures</span>
        </button>
      </div>

      {/* SECTION A: BASIC INFO */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="admin-card p-6 space-y-5">
              <h3 className="text-base font-bold text-foreground font-heading border-b border-border pb-3">
                General Brand Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Brand Display Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. SolarPro"
                    className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl outline-none font-semibold text-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Visible in header and email footers</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Route Slug (URL identifier) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(slugify(e.target.value));
                        setIsSlugManuallyEdited(true);
                      }}
                      placeholder="e.g. solarpro"
                      className={`w-full px-3.5 py-2.5 bg-card border rounded-xl outline-none font-mono text-xs font-semibold ${
                        slugError ? 'border-rose-400 text-rose-600' : 'border-border focus:border-blue-500 text-foreground'
                      }`}
                    />
                    {slugChecking && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-600 font-bold">
                        Checking...
                      </span>
                    )}
                  </div>
                  {slugError ? (
                    <p className="text-[11px] text-rose-500 font-medium mt-1">{slugError}</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-1">Used for local testing via <code>?brand={slug || 'slug'}</code></p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Custom Live Domain *</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="e.g. quote.solarpro.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl outline-none font-mono text-xs text-foreground"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Production apex domain or subdomain</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Industry Vertical *</label>
                  <select
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl font-semibold text-foreground outline-none focus:border-blue-500"
                  >
                    {DEFAULT_VERTICALS.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Sub-Vertical Tag</label>
                  <input
                    type="text"
                    value={subVertical}
                    onChange={(e) => setSubVertical(e.target.value)}
                    placeholder="e.g. windows, asthma, pain_relief"
                    className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl outline-none font-medium text-foreground"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-foreground mb-2">Publishing Status</label>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {isActive ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Active &amp; Accepting Traffic</span>
                      ) : (
                        <span className="text-muted-foreground">Draft / Paused</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="admin-card p-6 space-y-4">
              <h4 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>How LeadFlow Routes Traffic</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When a visitor accesses your domain or dev query <code>?brand={slug || 'slug'}</code>, the edge middleware resolves the brand configuration instantly from Supabase and renders the public funnel matching your form schema.
              </p>
              <div className="p-3 bg-secondary rounded-xl text-xs space-y-1 font-mono text-muted-foreground">
                <div>Domain: <span className="text-foreground font-bold">{domain || 'None'}</span></div>
                <div>Slug: <span className="text-foreground font-bold">{slug || 'None'}</span></div>
                <div>Status: <span className={isActive ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{isActive ? 'Active' : 'Draft'}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: THEME & HERO EDITOR */}
      {activeTab === 'theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-6">
            <div className="admin-card p-6 space-y-5">
              <h3 className="text-base font-bold text-foreground font-heading border-b border-border pb-3">
                Visual Branding &amp; Palette
              </h3>

              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-foreground flex items-center gap-2">
                      <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Primary Accent Color *</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-muted-foreground">
                      {themeConfig.primary_color || '#2563eb'}
                    </span>
                  </div>

                  {/* Top row: Color Picker Wheel, Hex Text Input, and Swatches */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative group">
                      <input
                        type="color"
                        value={parseColorAndOpacity(themeConfig.primary_color || '#2563eb').hex}
                        onChange={(e) => {
                          const { opacity } = parseColorAndOpacity(themeConfig.primary_color || '#2563eb');
                          const newCombined = combineColorAndOpacity(e.target.value, opacity);
                          setThemeConfig({ ...themeConfig, primary_color: newCombined });
                        }}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-border p-0.5 bg-card shadow-2xs hover:scale-105 transition-transform"
                        title="Click to open full color spectrum & wheel picker"
                      />
                    </div>

                    <div className="relative min-w-[110px] max-w-[140px]">
                      <input
                        type="text"
                        value={themeConfig.primary_color || '#2563eb'}
                        onChange={(e) => setThemeConfig({ ...themeConfig, primary_color: e.target.value })}
                        placeholder="#2563eb"
                        className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-mono font-bold text-foreground outline-none focus:border-blue-500 shadow-2xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = parseColorAndOpacity(themeConfig.primary_color || '#2563eb').hex.toLowerCase() === c.toLowerCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              const { opacity } = parseColorAndOpacity(themeConfig.primary_color || '#2563eb');
                              const newCombined = combineColorAndOpacity(c, opacity);
                              setThemeConfig({ ...themeConfig, primary_color: newCombined });
                            }}
                            className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 cursor-pointer shadow-2xs ${
                              isSelected ? 'ring-2 ring-blue-500 ring-offset-2 border-white' : 'border-border'
                            }`}
                            style={{ backgroundColor: c }}
                            title={`Preset: ${c}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Alpha / Opacity Slider for Glass Aesthetic */}
                <div className="p-3.5 bg-secondary/70 rounded-xl border border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Glass Accent Opacity / Alpha</span>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-card px-2 py-0.5 rounded-md border border-border text-[11px]">
                      {parseColorAndOpacity(themeConfig.primary_color || '#2563eb').opacity}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={parseColorAndOpacity(themeConfig.primary_color || '#2563eb').opacity}
                      onChange={(e) => {
                        const { hex } = parseColorAndOpacity(themeConfig.primary_color || '#2563eb');
                        const newCombined = combineColorAndOpacity(hex, parseInt(e.target.value, 10));
                        setThemeConfig({ ...themeConfig, primary_color: newCombined });
                      }}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-muted rounded-lg"
                    />

                    {/* Visual Checkered Swatch Preview */}
                    <div
                      className="w-7 h-7 rounded-lg border border-border shrink-0 shadow-2xs overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                        backgroundSize: '6px 6px',
                        backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px'
                      }}
                      title="Live alpha opacity preview"
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: themeConfig.primary_color || '#2563eb' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    {[
                      { label: '100% Solid', val: 100 },
                      { label: '85% Glass', val: 85 },
                      { label: '70% Tint', val: 70 },
                      { label: '50% Muted', val: 50 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          const { hex } = parseColorAndOpacity(themeConfig.primary_color || '#2563eb');
                          const newCombined = combineColorAndOpacity(hex, preset.val);
                          setThemeConfig({ ...themeConfig, primary_color: newCombined });
                        }}
                        className="px-2 py-0.5 bg-card hover:bg-muted rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Typography Font Family</label>
                <select
                  value={themeConfig.font_style || 'Inter, sans-serif'}
                  onChange={(e) => setThemeConfig({ ...themeConfig, font_style: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-blue-500 cursor-pointer"
                >
                  {DEFAULT_FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Hero Headline Text *</label>
                <textarea
                  rows={2}
                  required
                  value={themeConfig.headline || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, headline: e.target.value })}
                  placeholder="e.g. Find Top-Rated Window Replacement Experts Near You"
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Logo Image Asset URL</label>
                <input
                  type="text"
                  value={themeConfig.logo_url || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, logo_url: e.target.value })}
                  placeholder="https://... or /brands/logo.svg"
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-mono text-foreground outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-muted-foreground mt-1">SVG or high-res PNG image link for the landing header</p>
                {isProxyOrFragileImageUrl(themeConfig.logo_url) && (
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
                  <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Background Image URL (Optional)</span>
                </label>
                <input
                  type="text"
                  value={themeConfig.background_image_url || ''}
                  onChange={(e) => setThemeConfig({ ...themeConfig, background_image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... (full bleed hero background)"
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-mono text-foreground outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Optional hero background image with dark overlay</p>
                {isProxyOrFragileImageUrl(themeConfig.background_image_url) && (
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
          </div>

          {/* Live Landing Hero Preview Panel */}
          <div className="lg:col-span-6">
            <div className="sticky top-24 admin-card p-6 border-2 border-blue-100 dark:border-blue-900 bg-card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-bold text-foreground font-heading">Real-Time Hero Banner Preview</h4>
                </div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  {domain || 'yourdomain.com'}
                </span>
              </div>

              <div
                className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl overflow-hidden relative border border-slate-800 bg-cover bg-center"
                style={{
                  fontFamily: themeConfig.font_style || 'Inter, sans-serif',
                  backgroundImage: themeConfig.background_image_url ? `url(${themeConfig.background_image_url})` : undefined,
                }}
              >
                {themeConfig.background_image_url && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      {themeConfig.logo_url ? (
                        <div className="w-8 h-8 aspect-square p-1 rounded-xl bg-white/95 backdrop-blur-sm border border-white/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={themeConfig.logo_url}
                            alt="Logo Preview"
                            className="w-full h-full object-contain block"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 aspect-square rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs text-white shrink-0"
                          style={{ backgroundColor: themeConfig.primary_color || '#2563eb' }}
                        >
                          {name ? name.slice(0, 2).toUpperCase() : 'LF'}
                        </div>
                      )}
                      <span className="font-bold text-sm tracking-tight">{name || 'Brand Name'}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/60">
                      Live Preview
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 text-center">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: themeConfig.primary_color || '#2563eb' }}
                    >
                      {vertical.replace('_', ' ')}
                    </span>
                    <h1 className="text-xl md:text-2xl font-extrabold leading-tight tracking-tight">
                      {themeConfig.headline || 'Find Top-Rated Experts Near You'}
                    </h1>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      Welcome to {name || 'Brand'}. Complete the quick form below to get matched.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all duration-200 cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: themeConfig.primary_color || '#2563eb' }}
                  >
                    Start Assessment →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: VISUAL FORM BUILDER */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Step & Field Builder Controls */}
          <div className="xl:col-span-7 space-y-6">
            <div className="admin-card p-6 space-y-6">
              {/* Form Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground font-heading">Multi-Step Form Schema</h3>
                  <p className="text-xs text-muted-foreground font-medium">Add steps, fields, validation rules &amp; choices</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openRawJsonEditor}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Edit Raw JSON</span>
                  </button>
                </div>
              </div>

              {/* Step Tabs Switcher */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Form Steps ({formSchema.steps.length}):
                  </span>
                  <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formSchema.steps.map((st, idx) => (
                    <button
                      key={st.step_id || idx}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        activeStepIndex === idx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      Step {idx + 1}: {st.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Step Details */}
              {currentStep && (
                <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                        Step {activeStepIndex + 1} Title
                      </label>
                      <input
                        type="text"
                        value={currentStep.title || ''}
                        onChange={(e) => updateStepTitle(activeStepIndex, e.target.value)}
                        placeholder="e.g. Project Details"
                        className="w-full px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold text-foreground outline-none focus:border-blue-500"
                      />
                    </div>
                    {formSchema.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(activeStepIndex)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 mt-4 transition-colors cursor-pointer"
                        title="Delete this step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick-Add Toolbox for this Step */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      + Add Question Field:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { type: 'text', label: 'Text' },
                        { type: 'email', label: 'Email' },
                        { type: 'phone', label: 'Phone' },
                        { type: 'zip_code', label: 'ZIP Code' },
                        { type: 'radio', label: 'Radio Group' },
                        { type: 'select', label: 'Dropdown Select' },
                        { type: 'checkbox', label: 'Checkbox Consent' },
                      ].map((t) => (
                        <button
                          key={t.type}
                          type="button"
                          onClick={() => addFieldToCurrentStep(t.type as FormFieldType)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-card hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-border hover:border-blue-300 text-xs font-semibold text-foreground hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fields List for Current Step */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Questions in this Step ({currentStep.fields.length}):
                    </span>

                    {currentStep.fields.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-card">
                        No fields in this step. Use the buttons above to add fields.
                      </div>
                    ) : (
                      currentStep.fields.map((field, fIdx) => {
                        const isExpanded = expandedFields[field.name] ?? true;
                        const isOptionType = field.type === 'radio' || field.type === 'select' || field.type === 'checkbox';

                        return (
                          <div
                            key={field.name || fIdx}
                            className="p-4 rounded-2xl bg-card border border-border space-y-3 transition-all shadow-2xs"
                          >
                            {/* Field Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-muted-foreground">#{fIdx + 1}</span>
                                <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
                                  {field.label || 'Untitled Question'}
                                </span>
                                <span className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                  {field.type}
                                </span>
                                {field.required && (
                                  <span className="text-[10px] font-bold text-rose-500">*Required</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={fIdx === 0}
                                  onClick={() => moveField(fIdx, 'up')}
                                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={fIdx === currentStep.fields.length - 1}
                                  onClick={() => moveField(fIdx, 'down')}
                                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedFields((p) => ({ ...p, [field.name]: !isExpanded }))}
                                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeFieldFromCurrentStep(fIdx)}
                                  className="p-1 rounded-lg text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Field Inline Controls (Collapsible) */}
                            {isExpanded && (
                              <div className="space-y-3 pt-2 border-t border-border text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                      Field Label *
                                    </label>
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) => updateFieldInCurrentStep(fIdx, { label: e.target.value })}
                                      className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-xl outline-none focus:border-blue-500 font-semibold text-foreground"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                      Identifier (Key Name) *
                                    </label>
                                    <input
                                      type="text"
                                      value={field.name}
                                      onChange={(e) => updateFieldInCurrentStep(fIdx, { name: slugify(e.target.value).replace(/-/g, '_') })}
                                      className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-xl outline-none focus:border-blue-500 font-mono text-foreground"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                      Field Type
                                    </label>
                                    <select
                                      value={field.type}
                                      onChange={(e) => updateFieldInCurrentStep(fIdx, { type: e.target.value as FormFieldType })}
                                      className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-xl outline-none focus:border-blue-500 font-semibold text-foreground"
                                    >
                                      <option value="text">Text</option>
                                      <option value="email">Email</option>
                                      <option value="phone">Phone</option>
                                      <option value="zip_code">ZIP Code</option>
                                      <option value="radio">Radio Group</option>
                                      <option value="select">Dropdown Select</option>
                                      <option value="checkbox">Single Checkbox</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                                      Placeholder Text
                                    </label>
                                    <input
                                      type="text"
                                      value={field.placeholder || ''}
                                      onChange={(e) => updateFieldInCurrentStep(fIdx, { placeholder: e.target.value })}
                                      placeholder="e.g. Enter details..."
                                      className="w-full px-3 py-1.5 bg-secondary/50 border border-border rounded-xl outline-none focus:border-blue-500 text-foreground"
                                    />
                                  </div>

                                  <div className="pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(field.required)}
                                        onChange={(e) => updateFieldInCurrentStep(fIdx, { required: e.target.checked })}
                                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                                      />
                                      <span className="text-xs font-semibold text-foreground">
                                        Required Question (Cannot proceed if empty)
                                      </span>
                                    </label>
                                  </div>
                                </div>

                                {/* Option Sub-List for Radio, Select, Checkbox */}
                                {isOptionType && (
                                  <div className="p-3 bg-secondary/60 rounded-xl border border-border space-y-2 mt-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Options List ({field.options?.length || 0}):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => addOptionToField(fIdx)}
                                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Option</span>
                                      </button>
                                    </div>

                                    {field.options?.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={opt.label}
                                          onChange={(e) => updateOption(fIdx, oIdx, 'label', e.target.value)}
                                          placeholder="Option Label"
                                          className="flex-1 px-2.5 py-1 bg-card border border-border rounded-lg text-xs font-medium text-foreground"
                                        />
                                        <input
                                          type="text"
                                          value={opt.value}
                                          onChange={(e) => updateOption(fIdx, oIdx, 'value', e.target.value)}
                                          placeholder="Value"
                                          className="w-28 px-2.5 py-1 bg-card border border-border rounded-lg text-xs font-mono text-foreground"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeOption(fIdx, oIdx)}
                                          className="p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Interactive Dynamic Form Preview */}
          <div className="xl:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="admin-card p-5 border-2 border-blue-100 dark:border-blue-900 bg-card">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-foreground font-heading">
                      Live DynamicForm Component Preview
                    </h4>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white shadow-2xs"
                    style={{ backgroundColor: themeConfig.primary_color || '#2563eb' }}
                  >
                    Interactive
                  </span>
                </div>

                {/* Real DynamicForm Component Simulation */}
                <DynamicFormPreview
                  brandName={name}
                  formSchema={formSchema}
                  themeConfig={themeConfig}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION D: LEGAL & DISCLOSURES */}
      {activeTab === 'legal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="admin-card p-6 space-y-5">
              <h3 className="text-base font-bold text-foreground font-heading border-b border-border pb-3">
                Legal Copy &amp; TCPA Compliance
              </h3>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  TCPA Consent Disclosure Notice
                </label>
                <textarea
                  rows={3}
                  value={legalCopy.tcpa_text || ''}
                  onChange={(e) => setLegalCopy({ ...legalCopy, tcpa_text: e.target.value })}
                  placeholder="I agree to receive automated calls, texts, and emails..."
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Shown directly below the submit button for TCPA &amp; FCC compliance
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  General Disclaimer Notice
                </label>
                <textarea
                  rows={3}
                  value={legalCopy.disclaimer || ''}
                  onChange={(e) => setLegalCopy({ ...legalCopy, disclaimer: e.target.value })}
                  placeholder="Participation in this matching service is voluntary..."
                  className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Privacy Policy URL</label>
                  <input
                    type="url"
                    value={legalCopy.privacy_url || ''}
                    onChange={(e) => setLegalCopy({ ...legalCopy, privacy_url: e.target.value })}
                    placeholder="https://example.com/privacy"
                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-mono text-foreground outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Terms of Service URL</label>
                  <input
                    type="url"
                    value={legalCopy.terms_url || ''}
                    onChange={(e) => setLegalCopy({ ...legalCopy, terms_url: e.target.value })}
                    placeholder="https://example.com/terms"
                    className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl text-xs font-mono text-foreground outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RAW JSON EDIT MODAL */}
      {isRawJsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">Advanced: Raw JSON Form Schema</h3>
                <p className="text-xs text-muted-foreground font-medium">Direct JSON editing for power users</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRawJsonModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {rawJsonError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                  {rawJsonError}
                </div>
              )}
              <textarea
                rows={16}
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="p-4 border-t border-border flex items-center justify-end gap-3 bg-secondary/50">
              <button
                type="button"
                onClick={() => setIsRawJsonModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyRawJson}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Apply Schema to Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
