"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { X, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const ExpandableModal: React.FC<ExpandableModalProps> = ({
  isOpen,
  onClose,
  layoutId,
  children,
  className,
  maxWidth = "max-w-2xl",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useOutsideClick(ref, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Morphing Expanded Content Container */}
          <motion.div
            layoutId={layoutId}
            ref={ref}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "relative w-full z-10 bg-card border border-border text-card-foreground rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col",
              maxWidth,
              className
            )}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ExpandableMetricCardProps {
  id: string;
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  detailedStats?: { label: string; value: string | number; change?: string }[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ExpandableMetricCard: React.FC<ExpandableMetricCardProps> = ({
  id,
  title,
  value,
  trend,
  trendPositive = true,
  subtitle,
  icon,
  iconBgColor = "bg-blue-500/10 text-blue-500",
  detailedStats,
  actionLabel,
  onAction,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const layoutId = `metric-card-${id}`;

  return (
    <>
      {/* Compact Card in the Grid */}
      <motion.div
        layoutId={layoutId}
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative p-4 rounded-2xl bg-card border border-border shadow-xs hover:border-neutral-700/60 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between select-none",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn("p-2 rounded-xl shrink-0 flex items-center justify-center", iconBgColor)}>
              {icon}
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <h4 className="text-2xl font-bold font-heading text-foreground tracking-tight">
            {value}
          </h4>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0",
                trendPositive
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
              )}
            >
              {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
      </motion.div>

      {/* Morphing Detailed Modal */}
      <ExpandableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        layoutId={layoutId}
        maxWidth="max-w-xl"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={cn("p-3 rounded-xl shrink-0 flex items-center justify-center", iconBgColor)}>
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-foreground">{title} Deep-Dive</h3>
              <p className="text-xs text-muted-foreground">Comprehensive platform metric audit</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 flex items-baseline justify-between mb-6">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">Current Value</span>
              <div className="text-3xl font-extrabold font-heading text-foreground mt-0.5">{value}</div>
            </div>
            {trend && (
              <div
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-lg",
                  trendPositive
                    ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-rose-500 bg-rose-500/10 border border-rose-500/20"
                )}
              >
                {trend} vs prior period
              </div>
            )}
          </div>

          {detailedStats && detailedStats.length > 0 && (
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Metric Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {detailedStats.map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border">
                    <span className="text-[11px] text-muted-foreground block">{stat.label}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-bold text-foreground">{stat.value}</span>
                      {stat.change && (
                        <span className="text-[10px] text-emerald-500 font-semibold">{stat.change}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionLabel && (
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onAction) onAction();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>{actionLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </ExpandableModal>
    </>
  );
};

interface ExpandableStatusBadgeProps {
  id: string;
  status: string;
  contextText: string;
  details?: { label: string; value: string }[];
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export const ExpandableStatusBadge: React.FC<ExpandableStatusBadgeProps> = ({
  id,
  status,
  contextText,
  details,
  variant = "info",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const layoutId = `badge-${id}`;

  const variantStyles = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:border-rose-500/40",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/40",
    neutral: "bg-secondary text-muted-foreground border-border hover:border-neutral-600",
  };

  return (
    <div className="inline-block relative">
      <motion.button
        layoutId={layoutId}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer select-none",
          variantStyles[variant],
          className
        )}
        title="Click for status details"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{status}</span>
      </motion.button>

      <ExpandableModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        layoutId={layoutId}
        maxWidth="max-w-sm"
      >
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-current inline-block" />
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">{status} Status</h4>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {contextText}
          </p>

          {details && details.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-border">
              {details.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ExpandableModal>
    </div>
  );
};
