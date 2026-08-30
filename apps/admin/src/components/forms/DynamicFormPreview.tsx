'use client';

import React, { useState } from 'react';
import { ThemeConfig, FormSchema, FormStep } from '@leadflow/shared';

interface DynamicFormPreviewProps {
  brandName: string;
  formSchema: FormSchema;
  themeConfig: ThemeConfig;
}

export const DynamicFormPreview: React.FC<DynamicFormPreviewProps> = ({
  brandName,
  formSchema,
  themeConfig,
}) => {
  const steps = formSchema?.steps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const primaryColor = themeConfig?.primary_color || '#2563eb';
  const fontFamily = themeConfig?.font_style || 'Inter, sans-serif';

  if (!steps.length || !steps[0]?.fields?.length) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-border text-muted-foreground">
        <p className="text-sm font-semibold">No form fields configured yet.</p>
        <p className="text-xs mt-1">Add fields to your form schema to preview the interactive funnel form.</p>
      </div>
    );
  }

  const activeIndex = Math.min(currentStepIndex, steps.length - 1);
  const currentStep = steps[activeIndex] || steps[0];
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === steps.length - 1;

  const handleInputChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    step.fields.forEach((field) => {
      if (field.required) {
        const val = formData[field.name];
        if (val === undefined || val === null || val === '') {
          newErrors[field.name] = `${field.label} is required`;
          return;
        }
      }

      const val = formData[field.name];
      if (val && typeof val === 'string') {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val)) {
            newErrors[field.name] = 'Please enter a valid email address';
          }
        } else if (field.type === 'phone') {
          const digits = val.replace(/\D/g, '');
          if (digits.length < 10) {
            newErrors[field.name] = 'Please enter a valid 10-digit phone number';
          }
        } else if (field.type === 'zip_code') {
          const zipRegex = /^\d{5}(-\d{4})?$/;
          if (!zipRegex.test(val)) {
            newErrors[field.name] = 'Please enter a valid 5-digit ZIP code';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsSubmitted(true);
    }
  };

  const resetTest = () => {
    setIsSubmitted(false);
    setCurrentStepIndex(0);
    setFormData({});
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <div
        className="bg-card rounded-2xl shadow-xl p-8 max-w-xl mx-auto text-center border border-border my-4 animate-in zoom-in-95 duration-200"
        style={{ fontFamily }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-foreground mb-2">Form Submission Success!</h2>
        <p className="text-muted-foreground text-xs mb-4">
          This is an interactive simulation of the lead capture flow for <strong>{brandName || 'Brand'}</strong>.
        </p>
        <div className="bg-secondary p-3 rounded-xl border border-border text-left text-xs font-mono mb-4 max-h-40 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Captured Test Data:</div>
          <pre className="text-foreground">{JSON.stringify(formData, null, 2)}</pre>
        </div>
        <button
          type="button"
          onClick={resetTest}
          className="px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: primaryColor }}
        >
          Test Again ↺
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-card rounded-2xl shadow-lg p-6 sm:p-7 max-w-xl mx-auto border border-border my-2"
      style={{ fontFamily }}
    >
      {/* Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
          <span>
            Step {activeIndex + 1} of {steps.length}
          </span>
          <span>{Math.round(((activeIndex + 1) / steps.length) * 100)}% Completed</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${((activeIndex + 1) / steps.length) * 100}%`,
              backgroundColor: primaryColor,
            }}
          />
        </div>
      </div>

      {/* Step Title */}
      <h2 className="text-lg font-bold text-foreground mb-5 font-heading">
        {currentStep.title || `Step ${activeIndex + 1}`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {currentStep.fields.map((field) => (
          <div key={field.name} className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-foreground">
              {field.label} {field.required && <span className="text-rose-500">*</span>}
            </label>

            {/* Field Types */}
            {field.type === 'select' ? (
              <select
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-foreground bg-secondary/50 focus:bg-card focus:outline-none transition-all ${
                  errors[field.name] ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-border'
                }`}
              >
                <option value="">{field.placeholder || 'Select an option'}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'radio' ? (
              <div className="space-y-1.5 pt-0.5">
                {field.options?.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      formData[field.name] === opt.value
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 font-semibold text-foreground'
                        : 'border-border bg-card hover:bg-secondary/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={opt.value}
                      checked={formData[field.name] === opt.value}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border bg-card cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(formData[field.name])}
                  onChange={(e) => handleInputChange(field.name, e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded text-blue-600"
                />
                <span className="text-foreground font-medium">{field.label}</span>
              </label>
            ) : (
              <input
                type={field.type === 'phone' ? 'tel' : field.type === 'zip_code' ? 'text' : field.type}
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-foreground bg-secondary/50 focus:bg-card focus:outline-none transition-all placeholder:text-muted-foreground ${
                  errors[field.name] ? 'border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-border'
                }`}
              />
            )}

            {errors[field.name] && (
              <p className="text-[11px] text-rose-500 font-medium">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-3">
          {!isFirstStep ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-secondary transition-all cursor-pointer"
            >
              Back
            </button>
          ) : <div />}

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all ml-auto cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all ml-auto cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Submit Request →
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
