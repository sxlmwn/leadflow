'use client';

import React, { useId } from 'react';

interface GlowProgressRingProps {
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
  strokeWidth = 10,
  label,
  valueText,
  subtitle,
  gradientColors = ['#2563eb', '#3b82f6'],
  showCenterText = true
}) => {
  const rawId = useId();
  const filterId = `glow-${rawId.replace(/:/g, '')}`;
  const gradientId = `grad-${rawId.replace(/:/g, '')}`;

  const radius = size / 2;
  const normalizedRadius = radius - strokeWidth * 1.2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg height={size} width={size} className="transform -rotate-90 overflow-visible">
          <defs>
            {/* Linear Gradient Stroke */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} />
              <stop offset="100%" stopColor={gradientColors[1]} />
            </linearGradient>

            {/* Neon Glow Aura (feGaussianBlur constrained to arc) */}
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Neutral Track Ring */}
          <circle
            stroke="currentColor"
            className="text-slate-200/80 dark:text-zinc-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Glowing Arc Layer */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            filter={`url(#${filterId})`}
            opacity={0.7}
            className="transition-all duration-700 ease-out"
          />

          {/* Crisp Foreground Arc Layer */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text inside Ring */}
        {showCenterText && (
          <div className="absolute flex flex-col items-center justify-center text-center p-1 pointer-events-none">
            {label && (
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 tracking-wider">
                {label}
              </span>
            )}
            <span className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight font-heading leading-tight my-0.5">
              {valueText || `${percentage}%`}
            </span>
            {subtitle && (
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
