'use client';

import React, { useId } from 'react';

export interface CircularProgressRingProps {
  value: number; // 0 - 100
  size?: 'large' | 'small' | 'mini' | number;
  strokeWidth?: number;
  label?: string;
  displayValue?: string | number;
  subtitle?: string;
  color?: string | [string, string];
  trackColor?: string;
  showShadow?: boolean;
  className?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  size = 'large',
  strokeWidth,
  label,
  displayValue,
  subtitle,
  color = ['#2563eb', '#60a5fa'],
  trackColor = 'text-slate-100 dark:text-slate-800/90',
  showShadow = true,
  className = '',
}) => {
  const rawId = useId();
  const safeId = rawId.replace(/:/g, '');
  const gradientId = `ring-grad-${safeId}`;
  const filterId = `ring-shadow-${safeId}`;

  // Dimension presets matching reference "Readiness" & "Important Expenses"
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'large'
      ? 140
      : size === 'small'
      ? 54
      : 44;

  const actualStrokeWidth =
    strokeWidth ??
    (pixelSize >= 120 ? 10.5 : pixelSize >= 50 ? 5.5 : 4.5);

  const radius = pixelSize / 2;
  const normalizedRadius = radius - actualStrokeWidth * 1.1;
  const circumference = normalizedRadius * 2 * Math.PI;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const isLarge = pixelSize >= 100;
  const gradColors = Array.isArray(color) ? color : [color, color];

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {/* Soft Background Dial Disc for 3D Physical Lift (as seen in Readiness reference) */}
        {isLarge && showShadow && (
          <div
            className="absolute rounded-full bg-card shadow-[0_6px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.3)] border border-border/40 pointer-events-none"
            style={{
              width: pixelSize - actualStrokeWidth * 2.2,
              height: pixelSize - actualStrokeWidth * 2.2,
            }}
          />
        )}

        <svg
          height={pixelSize}
          width={pixelSize}
          className="transform -rotate-90 overflow-visible drop-shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
        >
          <defs>
            {/* Linear Gradient for Progress Arc */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradColors[0]} />
              <stop offset="100%" stopColor={gradColors[1]} />
            </linearGradient>

            {/* Soft Ambient Shadow Filter under Ring Arc */}
            {showShadow && (
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3"
                  floodColor={gradColors[0]}
                  floodOpacity={isLarge ? '0.22' : '0.15'}
                />
              </filter>
            )}
          </defs>

          {/* Light Gray Track Circle */}
          <circle
            stroke="currentColor"
            className={trackColor}
            fill="transparent"
            strokeWidth={actualStrokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Active Progress Arc with Rounded Line Caps & Soft Lift */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={actualStrokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            filter={showShadow ? `url(#${filterId})` : undefined}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content for Big Ring ("Readiness" style: small caption on top, large bold value below) */}
        {isLarge ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2 z-10">
            {label && (
              <span className="text-[11px] font-semibold text-muted-foreground leading-none mb-1">
                {label}
              </span>
            )}
            <span className="text-3xl font-extrabold text-foreground tracking-tight font-heading leading-tight">
              {displayValue !== undefined ? displayValue : `${Math.round(value)}%`}
            </span>
            {subtitle && (
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        ) : (
          /* Center content for mini ring when displayValue is explicitly provided */
          displayValue !== undefined && (
            <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] font-bold text-foreground">
                {displayValue}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CircularProgressRing;
