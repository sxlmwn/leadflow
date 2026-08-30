'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Mail,
  Phone,
  MapPin,
  CheckSquare,
  Radio,
  List,
  Eye,
  Save,
  Check
} from 'lucide-react';
import { AdminBrand } from '@/lib/data';

interface FormBuilderProps {
  brand: AdminBrand;
  onSave?: (updatedSchema: { fields: Array<Record<string, unknown>> }) => void;
}

interface FormFieldItem {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ brand, onSave }) => {
  const [fields, setFields] = useState<FormFieldItem[]>(
    (brand.form_schema?.fields as FormFieldItem[]) || [
      { id: 'zip', label: 'ZIP Code', type: 'zip', placeholder: 'Enter 5-digit ZIP', required: true },
      { id: 'project_type', label: 'Project Type', type: 'radio', options: ['Replacement', 'Repair', 'New Installation'], required: true },
      { id: 'window_count', label: 'Number of Windows', type: 'select', options: ['1-3 Windows', '4-9 Windows', '10+ Windows'], required: true },
      { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
      { id: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true },
      { id: 'phone', label: 'Phone Number', type: 'phone', placeholder: '(555) 000-0000', required: true }
    ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const primaryColor = brand.theme_config?.primary_color || '#2563eb';
  const fontFamily = brand.theme_config?.font_style || 'Inter, sans-serif';

  const addField = (type: string) => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const newField: FormFieldItem = {
      id: `field_${randomId}`,
      label: `New ${type.toUpperCase()} Field`,
      type,
      placeholder: `Enter ${type}...`,
      required: true,
      options: type === 'radio' || type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, key: keyof FormFieldItem, val: unknown) => {
    setFields(
      fields.map((f) => {
        if (f.id === id) {
          return { ...f, [key]: val };
        }
        return f;
      })
    );
  };

  const handleSave = () => {
    onSave?.({ fields: fields as unknown as Array<Record<string, unknown>> });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Visual No-Code Schema Editor (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="admin-card p-6 transform-gpu">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-foreground font-heading">Form Schema Editor</h3>
              <p className="text-xs text-muted-foreground font-medium">Add, reorder, and configure funnel step fields</p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Schema Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Schema</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Add Field Toolbox */}
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Add Field Type:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'text', icon: Type, label: 'Text' },
                { type: 'email', icon: Mail, label: 'Email' },
                { type: 'phone', icon: Phone, label: 'Phone' },
                { type: 'zip', icon: MapPin, label: 'ZIP' },
                { type: 'radio', icon: Radio, label: 'Radio' },
                { type: 'select', icon: List, label: 'Select' },
                { type: 'checkbox', icon: CheckSquare, label: 'Checkbox' },
              ].map((t) => (
                <button
                  key={t.type}
                  onClick={() => addField(t.type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-border hover:border-blue-300 text-foreground hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-all duration-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reorderable Field Cards */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-2xl bg-secondary/50 border border-border hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    <span className="text-xs font-mono font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="text-xs font-bold uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                      {field.type}
                    </span>
                  </div>

                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                      className="w-full px-3 py-1.5 bg-card border border-border rounded-xl outline-none focus:border-blue-500 font-medium text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                      className="w-full px-3 py-1.5 bg-card border border-border rounded-xl outline-none focus:border-blue-500 font-medium text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {(field.type === 'radio' || field.type === 'select') && (
                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase mb-1">
                      Options (comma separated)
                    </label>
                    <input
                      type="text"
                      value={field.options?.join(', ') || ''}
                      onChange={(e) =>
                        updateField(
                          field.id,
                          'options',
                          e.target.value.split(',').map((s) => s.trim())
                        )
                      }
                      className="w-full px-3 py-1.5 bg-card border border-border rounded-xl outline-none focus:border-blue-500 font-medium text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Live Form Preview in Brand Theme (5 Cols) */}
      <div className="lg:col-span-5">
        <div className="sticky top-24 admin-card p-6 border-2 border-blue-100 dark:border-blue-900 bg-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-foreground font-heading">Interactive Live Preview</h4>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-2xs"
              style={{ backgroundColor: primaryColor }}
            >
              {brand.name} Theme
            </span>
          </div>

          {/* Rendered Live Funnel Form */}
          <div
            className="p-6 rounded-2xl bg-secondary/80 border border-border space-y-4"
            style={{ fontFamily }}
          >
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                {brand.vertical.replace(/_/g, ' ')}
              </span>
              <h2 className="text-lg font-bold text-foreground leading-snug font-heading">
                {brand.theme_config?.headline || 'Get Your Free Quote'}
              </h2>
            </div>

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <label className="block text-xs font-bold text-foreground">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>

                  {f.type === 'radio' ? (
                    <div className="space-y-1.5">
                      {f.options?.map((opt: string, i: number) => (
                        <label
                          key={i}
                          className="flex items-center gap-2.5 p-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground cursor-pointer hover:border-blue-400"
                        >
                          <input type="radio" name={f.id} className="accent-blue-600" />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : f.type === 'select' ? (
                    <select className="w-full p-2.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-blue-500">
                      {f.options?.map((opt: string, i: number) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'phone' ? 'tel' : f.type === 'zip' ? 'text' : f.type}
                      placeholder={f.placeholder}
                      className="w-full p-2.5 bg-card border border-border rounded-xl text-xs text-foreground outline-none focus:border-blue-500 placeholder:text-muted-foreground"
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                className="w-full py-3 px-4 font-bold text-white text-xs rounded-xl shadow-xs transition-all duration-200 cursor-pointer mt-2 hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                Submit Request &amp; Get Instant Quote →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
