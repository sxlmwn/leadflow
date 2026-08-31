'use client';

import React from 'react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';

export interface CircularProgressRingProps {
  value: number; // 0 - 100 or metric count
  maxValue?: number;
  size?: 'large' | 'small' | 'mini' | number;
  strokeWidth?: number;
  label?: string;
  displayValue?: string | number;
  subtitle?: string;
  color?: string | [string, string];
  trackColor?: string;
  showShadow?: boolean;
  className?: string;
  startAngle?: number;
  endAngle?: number;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  maxValue = 100,
  size = 'large',
  label,
  displayValue,
  subtitle,
  color = '#2563eb',
  className = '',
  startAngle = 0,
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'large'
      ? 180
      : size === 'small'
      ? 64
      : 52;

  const isLarge = pixelSize >= 100;
  const clampedPercentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  // Calculate sweep angle based on percentage (360 degrees full circle)
  const sweepAngle = (clampedPercentage / 100) * 360;
  const calculatedEndAngle = startAngle + sweepAngle;

  const resolvedColor = Array.isArray(color) ? color[0] : color;

  const chartData = [
    {
      metric: 'progress',
      value: value,
      fill: resolvedColor,
    },
  ];

  const chartConfig = {
    value: {
      label: label || 'Progress',
      color: resolvedColor,
    },
  } satisfies ChartConfig;

  const outerRadius = isLarge ? 86 : 24;
  const innerRadius = isLarge ? 72 : 18;

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <ChartContainer
        config={chartConfig}
        className="w-full h-full aspect-square"
      >
        <RadialBarChart
          data={chartData}
          startAngle={startAngle}
          endAngle={calculatedEndAngle}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted/40 last:fill-background"
            polarRadius={[outerRadius, innerRadius]}
          />
          <RadialBar
            dataKey="value"
            background={{ fill: 'currentColor' }}
            className="[&_.recharts-radial-bar-background-sector]:fill-slate-100 dark:[&_.recharts-radial-bar-background-sector]:fill-slate-800/80"
            cornerRadius={isLarge ? 10 : 6}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  const cx = viewBox.cx || pixelSize / 2;
                  const cy = viewBox.cy || pixelSize / 2;

                  if (isLarge) {
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={cx}
                          y={label ? cy - 4 : cy}
                          className="fill-foreground text-3xl sm:text-4xl font-extrabold font-heading tracking-tight"
                        >
                          {displayValue !== undefined
                            ? displayValue
                            : `${Math.round(value)}%`}
                        </tspan>
                        {label && (
                          <tspan
                            x={cx}
                            y={cy + 22}
                            className="fill-muted-foreground text-xs font-semibold"
                          >
                            {label}
                          </tspan>
                        )}
                        {subtitle && (
                          <tspan
                            x={cx}
                            y={cy + 36}
                            className="fill-blue-600 dark:fill-blue-400 text-[10px] font-bold"
                          >
                            {subtitle}
                          </tspan>
                        )}
                      </text>
                    );
                  }

                  // Compact / Mini indicator
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={cx}
                        y={cy}
                        className="fill-foreground text-[11px] font-bold font-heading"
                      >
                        {displayValue !== undefined
                          ? displayValue
                          : `${Math.round(value)}%`}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
};

export default CircularProgressRing;
