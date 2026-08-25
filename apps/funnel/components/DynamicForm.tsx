'use client';

import { useState, useEffect } from 'react';
import { ThemeConfig } from '@/types/brand';

export interface FormOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'zip_code' | 'select' | 'radio' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
}

export interface FormStep {
  step_id: string;
  title: string;
  fields: FormField[];
}

export interface FormSchema {
  title?: string;
  description?: string;
  steps: FormStep[];
}

interface DynamicFormProps {
  brandId: string;
  brandSlug: string;
  formSchema: FormSchema;
  themeConfig: ThemeConfig;
}

export default function DynamicForm({
  brandId,
  brandSlug,
  formSchema,
  themeConfig,
}: DynamicFormProps) {
  const steps = formSchema?.steps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load TrustedForm script snippet on mount
  useEffect(() => {
    try {
      const tf = document.createElement('script');
      tf.type = 'text/javascript';
      tf.async = true;
      tf.src =
        (document.location.protocol === 'https:' ? 'https://' : 'http://') +
        'api.trustedform.com/trustedform.js?provide_option=trustedform&field=xxTrustedFormCertUrl&use_cors=true';

      const s = document.getElementsByTagName('script')[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(tf, s);
      }
    } catch (err) {
      console.warn('TrustedForm script load warning:', err);
    }
  }, []);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Helper to handle field value changes
  const handleChange = (name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // Helper to handle checkbox array values
  const handleCheckboxToggle = (name: string, value: string) => {
    const currentValues = (formData[name] as string[]) || [];
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    handleChange(name, updatedValues);
  };

  // Validate fields for current step
  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (!currentStep) return true;

    for (const field of currentStep.fields) {
      const val = formData[field.name];

      // Required field check
      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0)
        ) {
          stepErrors[field.name] = `${field.label} is required.`;
          continue;
        }
      }

      // Format validations if value is provided
      if (val && typeof val === 'string') {
        const trimmed = val.trim();
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(trimmed)) {
            stepErrors[field.name] = 'Please enter a valid email address.';
          }
        } else if (field.type === 'phone') {
          const phoneClean = trimmed.replace(/\D/g, '');
          if (phoneClean.length < 10) {
            stepErrors[field.name] = 'Please enter a valid 10-digit phone number.';
          }
        } else if (field.type === 'zip_code') {
          const zipRegex = /^\d{5}(-\d{4})?$/;
          if (!zipRegex.test(trimmed)) {
            stepErrors[field.name] = 'Please enter a valid 5-digit ZIP code.';
          }
        }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Read TrustedForm Cert URL hidden field if populated by script
    const tfCertElement = document.getElementById('xxTrustedFormCertUrl') as HTMLInputElement;
    const tfCertUrl = tfCertElement?.value || (formData.xxTrustedFormCertUrl as string) || null;

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          brand_slug: brandSlug,
          form_data: {
            ...formData,
            xxTrustedFormCertUrl: tfCertUrl,
          },
          trustedform_cert_url: tfCertUrl,
          funnel_step_reached: currentStepIndex + 1,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit lead.');
      }

      setIsSubmitted(true);
      setSubmittedLeadId(result.lead_id);
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-lg text-center max-w-xl mx-auto my-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-md"
          style={{ backgroundColor: themeConfig.primary_color }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Thank You!</h3>
        <p className="text-slate-600 mb-6">
          Your request has been successfully submitted, verified, and scored.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 text-xs font-mono space-y-1 mb-6 text-slate-700">
          <div><span className="font-semibold text-slate-900">Lead ID:</span> {submittedLeadId}</div>
          <div><span className="font-semibold text-slate-900">Verification Status:</span> Verified & Scored</div>
        </div>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({});
            setCurrentStepIndex(0);
          }}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow transition-transform hover:scale-[1.02] cursor-pointer"
          style={{ backgroundColor: themeConfig.primary_color }}
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm text-center">
        No form schema configured for this brand yet.
      </div>
    );
  }

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-8">
      {/* Hidden input field for TrustedForm Certificate */}
      <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />

      {/* Form Header */}
      <div className="p-6 md:p-8 bg-slate-900 text-white relative">
        {steps.length > 1 && (
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
            <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Completed</span>
          </div>
        )}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          {formSchema.title || currentStep.title}
        </h2>
        {formSchema.description && (
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            {formSchema.description}
          </p>
        )}

        {/* Progress Bar */}
        {steps.length > 1 && (
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                backgroundColor: themeConfig.primary_color,
              }}
            />
          </div>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="p-6 md:p-8 space-y-6">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {submitError}
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            {currentStep.title}
          </h3>

          {currentStep.fields.map((field) => {
            const fieldError = errors[field.name];
            const rawValue = formData[field.name];

            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-bold text-slate-800">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Field Type: Radio */}
                {field.type === 'radio' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field.options?.map((opt) => {
                      const isSelected = rawValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleChange(field.name, opt.value)}
                          className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'border-2 bg-slate-50 text-slate-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                          style={{
                            borderColor: isSelected ? themeConfig.primary_color : undefined,
                          }}
                        >
                          <span>{opt.label}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-transparent' : 'border-slate-300'
                            }`}
                            style={{
                              backgroundColor: isSelected ? themeConfig.primary_color : 'transparent',
                            }}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Field Type: Select */}
                {field.type === 'select' && (
                  <select
                    value={(rawValue as string) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="">-- Select an option --</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Field Type: Checkbox */}
                {field.type === 'checkbox' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field.options?.map((opt) => {
                      const selectedList = (rawValue as string[]) || [];
                      const isChecked = selectedList.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleCheckboxToggle(field.name, opt.value)}
                          className={`p-3.5 rounded-xl border text-left font-semibold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                            isChecked
                              ? 'border-2 bg-slate-50 text-slate-900 shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                          style={{
                            borderColor: isChecked ? themeConfig.primary_color : undefined,
                          }}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'border-transparent' : 'border-slate-300'
                            }`}
                            style={{
                              backgroundColor: isChecked ? themeConfig.primary_color : 'transparent',
                            }}
                          >
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Field Type: Text, Email, Phone, Zip Code */}
                {['text', 'email', 'phone', 'zip_code'].includes(field.type) && (
                  <input
                    type={field.type === 'email' ? 'email' : 'text'}
                    placeholder={field.placeholder || ''}
                    value={(rawValue as string) || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                )}

                {fieldError && (
                  <p className="text-xs font-semibold text-red-600 mt-1">{fieldError}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl text-white font-extrabold text-base shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: themeConfig.primary_color }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-3.5 rounded-xl text-white font-extrabold text-base shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: themeConfig.primary_color }}
            >
              Next Step &rarr;
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
