'use client';

import { useState, useEffect } from 'react';
import { ThemeConfig } from '@/types';

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
  formSchema: FormSchema;
  themeConfig: ThemeConfig;
}

export default function DynamicForm({
  brandId,
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
        (location.protocol === 'https:' ? 'https://' : 'http://') +
        'api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&ping_field=xxTrustedFormPingUrl&l=' +
        new Date().getTime() +
        Math.random();
      const s = document.getElementsByTagName('script')[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(tf, s);
      }
    } catch (e) {
      console.warn('TrustedForm script load warning:', e);
    }
  }, []);

  if (!steps.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No form steps configured for this brand.
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const primaryColor = themeConfig?.primary_color || '#2563eb';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Capture hidden TrustedForm cert URL input if present
      const certInput = document.querySelector<HTMLInputElement>(
        'input[name="xxTrustedFormCertUrl"]'
      );
      const certUrl = certInput ? certInput.value : undefined;

      const payload = {
        brand_id: brandId,
        form_data: {
          ...formData,
          ...(certUrl ? { xxTrustedFormCertUrl: certUrl } : {}),
        },
        funnel_step_reached: steps.length,
        funnel_variant: 'default',
        ...(certUrl ? { trustedform_cert_url: certUrl } : {}),
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      setIsSubmitted(true);
      setSubmittedLeadId(data.lead_id);
    } catch (err: unknown) {
      const error = err as Error;
      setSubmitError(error.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xl mx-auto text-center border border-gray-100 my-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-4">
          Your request has been successfully received. A specialist will reach out to you shortly.
        </p>
        {submittedLeadId && (
          <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs font-mono text-gray-500">
            Confirmation Reference: {submittedLeadId}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-xl mx-auto border border-gray-100 my-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
          <span>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Completed</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
              backgroundColor: primaryColor,
            }}
          />
        </div>
      </div>

      {/* Form Step Title */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">{currentStep.title}</h2>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {submitError}
        </div>
      )}

      {/* Hidden TrustedForm input fields */}
      <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />
      <input type="hidden" name="xxTrustedFormPingUrl" id="xxTrustedFormPingUrl" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {currentStep.fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>

            {/* Field Types */}
            {field.type === 'select' ? (
              <select
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors[field.name] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
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
              <div className="space-y-2 pt-1">
                {field.options?.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData[field.name] === opt.value
                        ? 'border-gray-900 bg-gray-50 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={opt.value}
                      checked={formData[field.name] === opt.value}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData[field.name])}
                  onChange={(e) => handleInputChange(field.name, e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            ) : (
              <input
                type={field.type === 'phone' ? 'tel' : field.type === 'zip_code' ? 'text' : field.type}
                value={(formData[field.name] as string) || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-4 py-3 rounded-xl border text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors[field.name] ? 'border-red-400 focus:ring-red-200' : 'border-gray-200'
                }`}
              />
            )}

            {errors[field.name] && (
              <p className="text-xs text-red-500 font-medium mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Form Action Controls */}
        <div className="flex items-center justify-between gap-4 pt-4">
          {!isFirstStep ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Back
            </button>
          ) : <div />}

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all ml-auto"
              style={{ backgroundColor: primaryColor }}
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md hover:opacity-90 transition-all disabled:opacity-50 ml-auto"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
