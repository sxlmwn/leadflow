'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { FunnelChart as BklitFunnelChart, type FunnelStage } from '@/components/ui/funnel-chart';
import { AreaChart as AreaIcon, BarChart2 as BarIcon, Filter as FunnelIcon } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

export type ChartMode = 'area' | 'bar' | 'funnel';
export type { FunnelStage };

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  unit?: string;
  prefix?: string;
  suffix?: string;
}

export interface ChartSwitcherProps {
  data: Array<Record<string, any>>;
  xAxisKey?: string;
  series: ChartSeries[];
  defaultMode?: ChartMode;
  mode?: ChartMode;
  onModeChange?: (mode: ChartMode) => void;
  height?: number | string;
  title?: string;
  subtitle?: string;
  spotlightColor?: string;
  headerRight?: React.ReactNode;
  headerLeft?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  cardClassName?: string;
  showCard?: boolean;
  showLegend?: boolean;
  funnelMode?: 'auto' | 'series' | 'categories';
  funnelStages?: FunnelStage[];
  funnelLayers?: number;
  funnelOrientation?: 'horizontal' | 'vertical';
}

export interface ChartSwitcherToggleProps {
  mode: ChartMode;
  onChange: (mode: ChartMode) => void;
  className?: string;
}

/**
 * Shared 3-button segmented-control toggle for Area / Bar / Funnel modes.
 * Uses exact existing theme colors, borders, and typography.
 */
export const ChartSwitcherToggle: React.FC<ChartSwitcherToggleProps> = ({
  mode,
  onChange,
  className = '',
}) => {
  const options: Array<{ key: ChartMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { key: 'area', label: 'Area', icon: AreaIcon },
    { key: 'bar', label: 'Bar', icon: BarIcon },
    { key: 'funnel', label: 'Funnel', icon: FunnelIcon },
  ];

  return (
    <div
      className={`flex items-center gap-1 bg-secondary/80 p-0.5 rounded-xl border border-border/70 ${className}`}
      role="group"
      aria-label="Chart type switcher"
    >
      {options.map(({ key, label, icon: Icon }) => {
        const isActive = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
            title={`Switch to ${label} chart`}
            aria-pressed={isActive}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

const STAGE_MONOCHROME_COLORS_LIGHT = [
  '#18181b',
  '#27272a',
  '#3f3f46',
  '#52525b',
  '#71717a',
  '#a1a1aa',
  '#d4d4d8',
];

const STAGE_MONOCHROME_COLORS_DARK = [
  '#ffffff',
  '#f4f4f5',
  '#e4e4e7',
  '#d4d4d8',
  '#a1a1aa',
  '#71717a',
  '#52525b',
];

/**
 * Shared ChartSwitcher Component
 * Dynamically switches between Area, Bar, and Funnel chart visualizations for the same dataset.
 */
export const ChartSwitcher: React.FC<ChartSwitcherProps> = ({
  data,
  xAxisKey = 'name',
  series,
  defaultMode = 'area',
  mode: controlledMode,
  onModeChange,
  height = 200,
  title,
  subtitle,
  spotlightColor,
  headerRight,
  headerLeft,
  footer,
  className = '',
  cardClassName = '',
  showCard = true,
  showLegend = true,
  funnelMode = 'auto',
  funnelStages,
  funnelLayers = 3,
  funnelOrientation = 'horizontal',
}) => {
  const [uncontrolledMode, setUncontrolledMode] = useState<ChartMode>(defaultMode);
  const currentMode = controlledMode ?? uncontrolledMode;
  const rawId = useId();
  const chartId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleModeChange = (newMode: ChartMode) => {
    if (onModeChange) {
      onModeChange(newMode);
    } else {
      setUncontrolledMode(newMode);
    }
  };

  // Adaptive series colors for high contrast in both light and dark mode
  const resolvedSeries = useMemo(() => {
    return series.map((s, idx) => {
      let color = s.color;
      if (isDark) {
        if (s.color === '#18181b' || s.color === '#09090b' || s.color === '#000000') {
          color = '#ffffff';
        } else if (s.color === '#27272a' || s.color === '#3f3f46') {
          color = '#e4e4e7';
        } else if (s.color === '#52525b' || s.color === '#71717a') {
          color = idx === 0 ? '#ffffff' : idx === 1 ? '#a1a1aa' : '#71717a';
        }
      }
      return { ...s, color };
    });
  }, [series, isDark]);

  const stageColors = isDark ? STAGE_MONOCHROME_COLORS_DARK : STAGE_MONOCHROME_COLORS_LIGHT;
  const primaryColor = spotlightColor || (isDark ? '#71717a' : resolvedSeries[0]?.color || '#18181b');

  // Compute funnel dataset from explicit funnelStages or fallback from data/series
  const resolvedFunnelStages = useMemo((): FunnelStage[] => {
    if (funnelStages && funnelStages.length > 0) {
      return funnelStages.map((stg, idx) => ({
        ...stg,
        color: isDark && (stg.color === '#18181b' || stg.color === '#27272a')
          ? stageColors[idx % stageColors.length]
          : stg.color,
      }));
    }

    if (!data || data.length === 0) return [];

    const isMultiSeries = resolvedSeries.length > 1;
    const shouldUseSeriesStages = funnelMode === 'series' || (funnelMode === 'auto' && isMultiSeries);

    if (shouldUseSeriesStages) {
      // Each series represents a pipeline stage (summed across all entries)
      return resolvedSeries.map((s, idx) => {
        const total = data.reduce((acc, row) => {
          const val = Number(row[s.key]);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        return {
          label: s.label,
          value: total,
          color: s.color || stageColors[idx % stageColors.length],
        };
      });
    } else {
      // Single series: take data points sorted descending
      const singleSeries = resolvedSeries[0];
      const items = data.map((row, idx) => {
        const val = Number(row[singleSeries?.key || 'value']);
        const label = String(row[xAxisKey] || `Step ${idx + 1}`);
        return {
          label,
          value: isNaN(val) ? 0 : val,
          color: stageColors[idx % stageColors.length],
        };
      });

      return [...items].sort((a, b) => b.value - a.value).slice(0, 5);
    }
  }, [funnelStages, data, resolvedSeries, xAxisKey, funnelMode, isDark, stageColors]);

  // Render the core chart visualization
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div
          style={{ height }}
          className="w-full flex items-center justify-center text-xs text-muted-foreground"
        >
          No data available
        </div>
      );
    }

    if (currentMode === 'bar') {
      return (
        <div style={{ width: '100%', height }} className="my-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#e2e8f0"
                className="dark:stroke-slate-800/60"
              />
              <XAxis
                dataKey={xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                cursor={{ stroke: '#71717a', strokeWidth: 1, strokeDasharray: '4 4' }}
                wrapperStyle={{ outline: 'none', zIndex: 60 }}
                contentStyle={{ backgroundColor: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-950/95 border border-zinc-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[140px] text-white backdrop-blur-md">
                        <p className="font-bold text-zinc-100 pb-1 border-b border-zinc-700/60 font-heading tracking-tight">
                          {label}
                        </p>
                        {payload.map((p, idx) => {
                          const s = resolvedSeries.find((item) => item.key === p.dataKey) || resolvedSeries[idx];
                          return (
                            <div
                              key={p.dataKey || idx}
                              className="flex items-center justify-between gap-3 font-medium text-zinc-200"
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/20"
                                  style={{ backgroundColor: p.color || s?.color || '#a1a1aa' }}
                                />
                                <span className="text-zinc-400">{s?.label || p.name}:</span>
                              </span>
                              <span className="font-mono font-bold text-white tabular-nums">
                                {s?.prefix || ''}
                                {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                                {s?.suffix || ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {resolvedSeries.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (currentMode === 'funnel') {
      return (
        <div
          style={{ width: '100%', height }}
          className="my-1 flex items-center justify-center relative overflow-visible"
        >
          <BklitFunnelChart
            data={resolvedFunnelStages}
            layers={funnelLayers}
            color={primaryColor}
            orientation={funnelOrientation}
            gap={6}
            edges="curved"
            className="w-full h-full"
          />
        </div>
      );
    }

    // Default: Area Chart Mode
    return (
      <div style={{ width: '100%', height }} className="my-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {resolvedSeries.map((s, idx) => (
                <linearGradient
                  key={s.key}
                  id={`chart-gradient-${chartId}-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.45 - idx * 0.08} />
                  <stop offset="50%" stopColor={s.color} stopOpacity={0.2 - idx * 0.05} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#e2e8f0"
              className="dark:stroke-slate-800/60"
            />

            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />

            <Tooltip
              cursor={{ stroke: '#71717a', strokeWidth: 1, strokeDasharray: '4 4' }}
              wrapperStyle={{ outline: 'none', zIndex: 60 }}
              contentStyle={{ backgroundColor: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-zinc-950/95 border border-zinc-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[140px] text-white backdrop-blur-md">
                      <p className="font-bold text-zinc-100 pb-1 border-b border-zinc-700/60 font-heading tracking-tight">
                        {label}
                      </p>
                      {payload.map((p, idx) => {
                        const s = resolvedSeries.find((item) => item.key === p.dataKey) || resolvedSeries[idx];
                        return (
                          <div
                            key={p.dataKey || idx}
                            className="flex items-center justify-between gap-3 font-medium text-zinc-200"
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0 ring-1 ring-white/20"
                                style={{ backgroundColor: p.color || s?.color || '#a1a1aa' }}
                              />
                              <span className="text-zinc-400">{s?.label || p.name}:</span>
                            </span>
                            <span className="font-mono font-bold text-white tabular-nums">
                              {s?.prefix || ''}
                              {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
                              {s?.suffix || ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />

            {resolvedSeries.map((s, idx) => (
              <Area
                key={s.key}
                type="natural"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.4 - idx * 0.3}
                fillOpacity={1}
                fill={`url(#chart-gradient-${chartId}-${s.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const chartContent = (
    <div className={`flex flex-col justify-between h-full ${className}`}>
      {/* Header Row: Title & Subtitle (Left) + Header Controls & Switcher Toggle (Right) */}
      {(title || subtitle || headerLeft || headerRight) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            {headerLeft}
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Series Legend Indicators (if enabled) */}
            {showLegend && resolvedSeries.length > 1 && (
              <div className="hidden md:flex items-center gap-3 text-xs font-semibold mr-1">
                {resolvedSeries.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-foreground text-[11px]">{s.label}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Custom Extra Header Controls (e.g. timeframe pills, sync buttons) */}
            {headerRight}

            {/* Segmented Control Switcher (Area / Bar / Funnel) */}
            <ChartSwitcherToggle mode={currentMode} onChange={handleModeChange} />
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      {renderChart()}

      {/* Optional Footer */}
      {footer}
    </div>
  );

  if (!showCard) {
    return chartContent;
  }

  return (
    <SpotlightCard
      color={primaryColor}
      tiltMax={4}
      className={`p-4 sm:p-6 flex flex-col justify-between h-full group ${cardClassName}`}
    >
      {chartContent}
    </SpotlightCard>
  );
};

export default ChartSwitcher;
