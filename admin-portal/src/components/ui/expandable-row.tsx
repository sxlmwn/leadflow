"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ExpandableDetailModal: React.FC<ExpandableDetailModalProps> = ({
  isOpen,
  onClose,
  layoutId,
  title,
  subtitle,
  badge,
  children,
  maxWidth = "max-w-2xl",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

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

  useOutsideClick(panelRef, onClose);

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
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
          />

          {/* Morphing Expanded Detail Container */}
          <motion.div
            layoutId={layoutId}
            ref={panelRef}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={cn(
              "relative w-full z-10 bg-card border border-border text-card-foreground rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto",
              maxWidth
            )}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {badge}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading">{title}</h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{subtitle}</p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
