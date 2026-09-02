'use client';

import React from 'react';
import { CircularProgressRing } from '@/components/ui/circular-progress-ring';

export interface GlowProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  valueText?: string;
  subtitle?: string;
  gradientColors?: [string, string];
  glowColor?: string;
  showCenterText?: boolean;
}

export const GlowProgressRing: React.FC<GlowProgressRingProps> = ({
  percentage,
  size = 140,
  strokeWidth,
  label,
  valueText,
  subtitle,
  gradientColors = ['#18181b', '#71717a'],
  showCenterText = true,
}) => {
  return (
    <CircularProgressRing
      value={percentage}
      size={size}
      strokeWidth={strokeWidth}
      label={showCenterText ? label : undefined}
      displayValue={showCenterText ? valueText : undefined}
      subtitle={showCenterText ? subtitle : undefined}
      color={gradientColors}
      showShadow={true}
    />
  );
};

export default GlowProgressRing;
