'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { ThemeConfig, FormSchema, FormStep, FormField, FormOption } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type { FormOption, FormField, FormStep, FormSchema };

interface DynamicFormProps {
  brandId: string;
  formSchema: FormSchema;
  themeConfig: ThemeConfig;
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.28,
      ease: 'easeOut',
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  }),
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.04,
      duration: 0.25,
      ease: 'easeOut',
    },
  }),
};

export default function DynamicForm({
  brandId,
  formSchema,
  themeConfig,
}: DynamicFormProps) {
  const steps = formSchema?.steps || [];
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
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
      <div className="p-8 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 max-w-xl mx-auto">
        No form steps configured for this brand.
      </div>
    );
  }

  const currentStep = steps[currentStepIndex] || steps[0];
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
      setDirection(1);
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setDirection(-1);
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
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-xl mx-auto my-4 w-full"
      >
        <Card className="rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/25 bg-white/[0.12] backdrop-blur-2xl p-8 sm:p-10 text-center text-white">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-white/20"
            style={{ backgroundColor: primaryColor, color: '#ffffff' }}
          >
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-black text-white mb-2 font-heading tracking-tight drop-shadow-sm">
            Thank You!
          </CardTitle>
          <CardDescription className="text-white/80 text-sm sm:text-base mb-6 max-w-md mx-auto leading-relaxed">
            Your request has been successfully received. A specialist will reach out to you shortly.
          </CardDescription>
          {submittedLeadId && (
            <div className="inline-block bg-black/35 border border-white/20 rounded-xl px-4 py-2.5 text-xs font-mono text-white/90 shadow-inner">
              Confirmation Reference: <span className="font-bold text-white">{submittedLeadId}</span>
            </div>
          )}
        </Card>
      </motion.div>
    );
  }

  const progressPercent =
    steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-xl mx-auto w-full my-auto"
    >
      <Card className="rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.65)] border border-white/20 bg-white/[0.12] backdrop-blur-2xl text-white overflow-hidden">
        {/* Step dots & thin animated progress bar header */}
        <CardHeader className="p-3.5 sm:p-5 pb-2.5 sm:pb-3.5 border-b border-white/10">
          {themeConfig?.headline && (
            <div className="text-center mb-2 sm:mb-2.5">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight drop-shadow-xs font-heading">
                {themeConfig.headline}
              </h1>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mb-2">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.step_id || idx} className="flex items-center">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center text-[7px]",
                      isCompleted
                        ? "text-white"
                        : isCurrent
                        ? "ring-2 ring-offset-1 ring-offset-black/40 scale-105"
                        : "bg-white/20"
                    )}
                    style={{
                      backgroundColor: isCompleted || isCurrent ? primaryColor : undefined,
                      borderColor: isCurrent ? primaryColor : undefined,
                      ...(isCurrent ? { boxShadow: `0 0 0 1.5px rgba(255,255,255,0.4), 0 0 0 3px ${primaryColor}` } : {}),
                    }}
                  >
                    {isCompleted && <Check className="w-2 h-2 text-white stroke-[3]" />}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-6 sm:w-10 h-0.5 mx-1 transition-colors duration-300",
                        idx < currentStepIndex ? "bg-white" : "bg-white/20"
                      )}
                      style={{
                        backgroundColor: idx < currentStepIndex ? primaryColor : undefined,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Thin animated progress bar */}
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </CardHeader>

        {/* Hidden TrustedForm input fields */}
        <input type="hidden" name="xxTrustedFormCertUrl" id="xxTrustedFormCertUrl" />
        <input type="hidden" name="xxTrustedFormPingUrl" id="xxTrustedFormPingUrl" />

        <form onSubmit={handleSubmit}>
          <CardContent className="p-3.5 sm:p-5 pt-3 sm:pt-4">
            {submitError && (
              <div className="mb-3.5 p-3 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-medium backdrop-blur-md">
                {submitError}
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStepIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-2.5 sm:space-y-3.5"
              >
                <div className="mb-2 sm:mb-2.5">
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight font-heading drop-shadow-xs">
                    {currentStep.title}
                  </h2>
                </div>

                {currentStep.fields.map((field, fieldIdx) => (
                  <motion.div
                    key={field.name}
                    custom={fieldIdx}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-1 text-left"
                  >
                    <Label className="block text-[11px] sm:text-xs font-bold text-white/95 drop-shadow-xs">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </Label>

                    {/* Dynamic Field Mapping */}
                    {field.type === 'select' ? (
                      <Select
                        value={(formData[field.name] as string) || ''}
                        onValueChange={(val) => handleInputChange(field.name, val)}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-10 sm:h-11 rounded-xl border border-white/20 bg-black/25 hover:bg-black/35 focus:bg-black/45 text-white text-xs sm:text-sm transition-all focus:ring-2 focus:ring-white/30 focus:border-white/60",
                            errors[field.name] && "border-red-400 focus:ring-red-400"
                          )}
                        >
                          <SelectValue placeholder={field.placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-white/20 bg-slate-950/95 backdrop-blur-2xl text-white shadow-2xl p-1">
                          {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="rounded-lg text-white text-xs sm:text-sm focus:bg-white/15 focus:text-white cursor-pointer">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === 'radio' ? (
                      <RadioGroup
                        value={(formData[field.name] as string) || ''}
                        onValueChange={(val) => handleInputChange(field.name, val)}
                        className="space-y-1.5 pt-0.5"
                      >
                        {field.options?.map((opt) => {
                          const isSelected = formData[field.name] === opt.value;
                          return (
                            <motion.label
                              key={opt.value}
                              whileHover={{ scale: 1.006 }}
                              whileTap={{ scale: 0.994 }}
                              className={cn(
                                "flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border cursor-pointer select-none transition-all duration-200",
                                isSelected
                                  ? "border-white/70 bg-white/20 shadow-xs font-bold text-white backdrop-blur-md"
                                  : "border-white/15 bg-black/25 hover:bg-black/35 hover:border-white/30 text-white/90"
                              )}
                              style={
                                isSelected
                                  ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}, 0 2px 10px -1px ${primaryColor}40` }
                                  : {}
                              }
                            >
                              <RadioGroupItem
                                value={opt.value}
                                id={`${field.name}-${opt.value}`}
                                className="border-white/50 text-white data-[state=checked]:border-white w-3.5 h-3.5"
                                style={
                                  isSelected
                                    ? { borderColor: primaryColor, color: primaryColor }
                                    : {}
                                }
                              />
                              <span className="text-xs sm:text-sm font-semibold text-white flex-1 drop-shadow-xs">
                                {opt.label}
                              </span>
                            </motion.label>
                          );
                        })}
                      </RadioGroup>
                    ) : field.type === 'checkbox' ? (
                      <motion.label
                        whileHover={{ scale: 1.006 }}
                        whileTap={{ scale: 0.994 }}
                        className={cn(
                          "flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border cursor-pointer select-none transition-all duration-200",
                          Boolean(formData[field.name])
                            ? "border-white/70 bg-white/20 shadow-xs font-bold text-white backdrop-blur-md"
                            : "border-white/15 bg-black/25 hover:bg-black/35 hover:border-white/30 text-white/90"
                        )}
                        style={
                          Boolean(formData[field.name])
                            ? { borderColor: primaryColor, boxShadow: `0 0 0 1px ${primaryColor}, 0 2px 10px -1px ${primaryColor}40` }
                            : {}
                        }
                      >
                        <Checkbox
                          id={field.name}
                          checked={Boolean(formData[field.name])}
                          onCheckedChange={(checked) =>
                            handleInputChange(field.name, Boolean(checked))
                          }
                          className="mt-0.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-black w-3.5 h-3.5"
                        />
                        <span className="text-xs sm:text-sm font-medium text-white/95 leading-snug drop-shadow-xs">
                          {field.label}
                        </span>
                      </motion.label>
                    ) : (
                      <Input
                        type={
                          field.type === 'phone'
                            ? 'tel'
                            : field.type === 'zip_code'
                            ? 'text'
                            : field.type
                        }
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        placeholder={
                          field.placeholder ||
                          (field.type === 'phone'
                            ? '(555) 000-0000'
                            : field.type === 'zip_code'
                            ? '10001'
                            : undefined)
                        }
                        className={cn(
                          "h-10 sm:h-11 rounded-xl border border-white/20 bg-black/25 hover:bg-black/35 focus:bg-black/45 text-white placeholder:text-white/40 px-3.5 text-xs sm:text-sm shadow-inner transition-all focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:border-white/60",
                          errors[field.name] && "border-red-400 focus-visible:ring-red-400"
                        )}
                      />
                    )}

                    {errors[field.name] && (
                      <p className="text-[11px] text-red-300 font-medium mt-0.5 drop-shadow-xs">
                        {errors[field.name]}
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          {/* Card Footer with Back and Next/Submit buttons */}
          <CardFooter className="flex items-center justify-between gap-3 pt-3 pb-3.5 sm:pb-4 px-3.5 sm:px-5 border-t border-white/10">
            {!isFirstStep ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="h-9 sm:h-10 px-4 rounded-xl border border-white/20 bg-white/10 text-white text-xs sm:text-sm font-semibold hover:bg-white/20 hover:text-white transition-all cursor-pointer shadow-xs backdrop-blur-sm active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-9 sm:h-10 px-5 rounded-xl text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 ml-auto transition-all cursor-pointer active:scale-95"
                style={{ backgroundColor: primaryColor, boxShadow: `0 3px 18px ${primaryColor}70` }}
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 sm:h-10 px-6 rounded-xl text-white text-xs sm:text-sm font-black shadow-md hover:opacity-95 ml-auto transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                style={{ backgroundColor: primaryColor, boxShadow: `0 3px 18px ${primaryColor}70` }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader
                      size="sm"
                      title="Submitting request..."
                      subtitle=""
                      className="p-0 gap-1.5 flex-row text-white dark:text-white [&_h1]:text-white [&_h1]:text-xs [&_div]:size-4 [&_span]:text-white"
                    />
                  </span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                    <span>Submit Request</span>
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
