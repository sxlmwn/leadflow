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
  color = '#18181b',
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

  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const rawColor = Array.isArray(color) ? color[0] : color;
  const isDefaultDark = !rawColor || rawColor === '#18181b' || rawColor === '#71717a';
  const resolvedColor = isDark
    ? (isDefaultDark ? '#ffffff' : rawColor)
    : (isDefaultDark ? '#18181b' : rawColor);

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
  const innerRadius = isLarge ? 70 : 17;

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
            className="first:fill-muted/20 last:fill-background"
            polarRadius={[outerRadius, innerRadius]}
          />
          <RadialBar
            dataKey="value"
            background={{ fill: isDark ? '#27272a' : '#e2e8f0' }}
            className="fill-zinc-900 dark:fill-white [&_.recharts-radial-bar-background-sector]:fill-zinc-200/90 dark:[&_.recharts-radial-bar-background-sector]:fill-zinc-800/90"
            cornerRadius={isLarge ? 10 : 6}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  const cx = viewBox.cx || pixelSize / 2;
                  const cy = viewBox.cy || pixelSize / 2;

                  const valText =
                    displayValue !== undefined
                      ? String(displayValue)
                      : `${Math.round(value)}%`;

                  if (isLarge) {
                    const fontSize =
                      valText.length > 6
                        ? '18px'
                        : valText.length > 4
                        ? '22px'
                        : '28px';

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
                          style={{ fontSize }}
                          className="fill-foreground font-extrabold font-heading tracking-tight"
                        >
                          {valText}
                        </tspan>
                        {label && (
                          <tspan
                            x={cx}
                            y={cy + 20}
                            className="fill-muted-foreground text-xs font-semibold"
                          >
                            {label}
                          </tspan>
                        )}
                        {subtitle && (
                          <tspan
                            x={cx}
                            y={cy + 34}
                            className="fill-muted-foreground text-[10px] font-bold"
                          >
                            {subtitle}
                          </tspan>
                        )}
                      </text>
                    );
                  }

                  // Compact / Mini indicator
                  const miniFontSize = valText.length > 4 ? '9px' : '11px';

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
                        style={{ fontSize: miniFontSize }}
                        className="fill-foreground font-bold font-heading"
                      >
                        {valText}
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
