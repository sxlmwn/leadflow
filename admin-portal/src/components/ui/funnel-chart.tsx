"use client";

import type { Transition, MotionValue } from "motion/react";
import { motion, useTransform, animate, useMotionValue } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// ─── Public types ───────────────────────────────────────────────────

export interface FunnelGradientStop {
  offset: string | number;
  color: string;
}

export interface FunnelStage {
  label: string;
  value: number;
  displayValue?: string;
  /** Override the chart-level color for this segment */
  color?: string;
  /**
   * Apply a linear gradient to this segment.
   * Provide an array of color stops, e.g. [{ offset: "0%", color: "#18181b" }, { offset: "100%", color: "#71717a" }].
   * When set, this takes priority over the segment and chart-level color for the innermost ring.
   * Outer halo rings use the first stop color as their solid color.
   */
  gradient?: FunnelGradientStop[];
}

export interface FunnelChartProps {
  data: FunnelStage[];
  orientation?: "horizontal" | "vertical";
  color?: string;
  layers?: number;
  className?: string;
  style?: CSSProperties;
  showPercentage?: boolean;
  showValues?: boolean;
  showLabels?: boolean;
  /** Controlled hover state — index of the hovered segment */
  hoveredIndex?: number | null;
  /** Callback when hover state changes */
  onHoverChange?: (index: number | null) => void;
  formatPercentage?: (pct: number) => string;
  formatValue?: (value: number) => string;
  /** Stagger delay between segments in seconds. Default 0.12 */
  staggerDelay?: number;
  /** Framer Motion transition for segment enter animation */
  enterTransition?: Transition;
  /** Gap between segments in pixels. Default 4 */
  gap?: number;
  /**
   * Render a custom pattern definition. Receives a unique id string per segment
   * and the resolved color. Return a pattern inside an SVG <defs>.
   */
  renderPattern?: (id: string, color: string) => ReactNode;
  /** Edge style for the funnel segments. Default "curved" */
  edges?: "curved" | "straight";
  /**
   * Controls how segment labels (value, percentage, stage name) are arranged.
   * - "spread": Value/percentage/label are spread apart. This is the default.
   * - "grouped": All label items stack together in a tight group.
   */
  labelLayout?: "spread" | "grouped";
  /**
   * Stack direction of the label group. Only applies when labelLayout="grouped".
   * - "vertical": Items stack top-to-bottom. Default for horizontal funnels.
   * - "horizontal": Items stack left-to-right. Default for vertical funnels.
   */
  labelOrientation?: "vertical" | "horizontal";
  /**
   * Where the label group sits within the segment cell.
   * - "center" (default), "start", "end"
   */
  labelAlign?: "center" | "start" | "end";
  /** Grid configuration. Pass true for default bands + lines, or an object for fine control. */
  grid?:
    | boolean
    | {
        /** Show alternating background bands behind each segment. Default true */
        bands?: boolean;
        /** Color of the background bands. Default "var(--color-muted)" */
        bandColor?: string;
        /** Show grid lines at each gap between segments. Default true */
        lines?: boolean;
        /** Color of the grid lines. Default "var(--chart-grid)" */
        lineColor?: string;
        /** Opacity of the grid lines. Default 1 */
        lineOpacity?: number;
        /** Width of the grid lines in pixels. Default 1 */
        lineWidth?: number;
      };
}

// ─── Animation helpers ──────────────────────────────────────────────

const DEFAULT_ENTER_TRANSITION: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
};

function useMountProgress(
  enterTransition: Transition | undefined,
  delaySeconds: number,
  replayKey: number | string = 0
) {
  const progress = useMotionValue(0);

  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, 1, {
      ...(enterTransition ?? DEFAULT_ENTER_TRANSITION),
      delay: delaySeconds,
    });
    return () => controls.stop();
  }, [delaySeconds, replayKey, progress, enterTransition]);

  return progress;
}

function useEnterComplete(mountProgress: MotionValue<number>): boolean {
  const [complete, setComplete] = useState(() => mountProgress.get() >= 1);

  useEffect(() => {
    if (mountProgress.get() >= 1) {
      setComplete(true);
      return;
    }

    return mountProgress.on("change", (value) => {
      if (value >= 1) {
        setComplete(true);
      }
    });
  }, [mountProgress]);

  return complete;
}

// ─── Defaults & Formatters ──────────────────────────────────────────

const fmtPct = (p: number) => `${Math.round(p)}%`;
const fmtVal = (v: number) => {
  if (typeof v !== "number" || isNaN(v)) return String(v);
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 10000) return `${(v / 1000).toFixed(1)}k`;
  return v.toLocaleString();
};

// ─── SVG Geometry Helpers ───────────────────────────────────────────

function hSegmentPath(
  normStart: number,
  normEnd: number,
  segW: number,
  H: number,
  layerScale: number,
  straight = false
) {
  const my = H / 2;
  const h0 = Math.max(normStart * H * 0.44 * layerScale, 4);
  const h1 = Math.max(normEnd * H * 0.44 * layerScale, 4);

  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`;
  }

  const cx = segW * 0.55;
  const top = `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1}`;
  const bot = `L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0}`;
  return `${top} ${bot} Z`;
}

function vSegmentPath(
  normStart: number,
  normEnd: number,
  segH: number,
  W: number,
  layerScale: number,
  straight = false
) {
  const mx = W / 2;
  const w0 = Math.max(normStart * W * 0.44 * layerScale, 4);
  const w1 = Math.max(normEnd * W * 0.44 * layerScale, 4);

  if (straight) {
    return `M ${mx - w0} 0 L ${mx - w1} ${segH} L ${mx + w1} ${segH} L ${mx + w0} 0 Z`;
  }

  const cy = segH * 0.55;
  const left = `M ${mx - w0} 0 C ${mx - w0} ${cy}, ${mx - w1} ${segH - cy}, ${mx - w1} ${segH}`;
  const right = `L ${mx + w1} ${segH} C ${mx + w1} ${segH - cy}, ${mx + w0} ${cy}, ${mx + w0} 0`;
  return `${left} ${right} Z`;
}

// ─── Animated Rings & Segments ──────────────────────────────────────

function HRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings,
}: {
  d: string;
  color: string;
  fill?: string;
  opacity: number;
  hovered: boolean;
  ringIndex: number;
  totalRings: number;
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;

  return (
    <motion.path
      animate={{ scaleY: hovered ? extraScale : 1 }}
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ transformOrigin: "center center" }}
      transition={{
        type: "spring",
        stiffness: 300 - ringIndex * 60,
        damping: 24 - ringIndex * 3,
      }}
    />
  );
}

function HSegment({
  index,
  normStart,
  normEnd,
  segW,
  fullH,
  color,
  layers,
  staggerDelay,
  enterTransition,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops,
}: {
  index: number;
  normStart: number;
  normEnd: number;
  segW: number;
  fullH: number;
  color: string;
  layers: number;
  staggerDelay: number;
  enterTransition?: Transition;
  hovered: boolean;
  dimmed: boolean;
  renderPattern?: (id: string, color: string) => ReactNode;
  straight: boolean;
  gradientStops?: FunnelGradientStop[];
}) {
  const patternId = `funnel-h-pattern-${index}`;
  const gradientId = `funnel-h-grad-${index}`;
  const mountProgress = useMountProgress(
    enterTransition,
    index * staggerDelay,
    index
  );
  const enterComplete = useEnterComplete(mountProgress);
  const entranceScaleX = useTransform(mountProgress, [0, 1], [0, 1]);
  const entranceScaleY = useTransform(mountProgress, [0, 1], [0, 1]);

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35;
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65;
    return {
      d: hSegmentPath(normStart, normEnd, segW, fullH, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      animate={{ opacity: dimmed ? 0.4 : 1 }}
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{
        width: segW,
        height: fullH,
        zIndex: hovered ? 10 : 1,
      }}
      transition={{ opacity: { duration: 0.15 } }}
    >
      {enterComplete ? (
        <div className="absolute inset-0 overflow-visible">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            role="presentation"
            viewBox={`0 0 ${segW} ${fullH}`}
          >
            <defs>
              {gradientStops && (
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                  {gradientStops.map((stop) => (
                    <stop
                      key={`${stop.offset}-${stop.color}`}
                      offset={
                        typeof stop.offset === "number"
                          ? `${stop.offset * 100}%`
                          : stop.offset
                      }
                      stopColor={stop.color}
                    />
                  ))}
                </linearGradient>
              )}
              {renderPattern?.(patternId, color)}
            </defs>
            {rings.map((r, i) => {
              const isInnermost = i === rings.length - 1;
              let ringFill: string | undefined;
              if (isInnermost && renderPattern) {
                ringFill = `url(#${patternId})`;
              } else if (isInnermost && gradientStops) {
                ringFill = `url(#${gradientId})`;
              }
              const ringKey = `h-ring-${r.opacity.toFixed(2)}`;
              return (
                <HRing
                  color={color}
                  d={r.d}
                  fill={ringFill}
                  hovered={hovered}
                  key={ringKey}
                  opacity={r.opacity}
                  ringIndex={i}
                  totalRings={layers}
                />
              );
            })}
          </svg>
        </div>
      ) : (
        <motion.div
          className="absolute inset-0 overflow-visible"
          style={{
            scaleX: entranceScaleX,
            scaleY: entranceScaleY,
            transformOrigin: "left center",
          }}
        >
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            role="presentation"
            viewBox={`0 0 ${segW} ${fullH}`}
          >
            <defs>
              {gradientStops && (
                <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                  {gradientStops.map((stop) => (
                    <stop
                      key={`${stop.offset}-${stop.color}`}
                      offset={
                        typeof stop.offset === "number"
                          ? `${stop.offset * 100}%`
                          : stop.offset
                      }
                      stopColor={stop.color}
                    />
                  ))}
                </linearGradient>
              )}
              {renderPattern?.(patternId, color)}
            </defs>
            {rings.map((r, i) => {
              const isInnermost = i === rings.length - 1;
              let ringFill: string | undefined;
              if (isInnermost && renderPattern) {
                ringFill = `url(#${patternId})`;
              } else if (isInnermost && gradientStops) {
                ringFill = `url(#${gradientId})`;
              }
              const ringKey = `h-ring-${r.opacity.toFixed(2)}`;
              return (
                <HRing
                  color={color}
                  d={r.d}
                  fill={ringFill}
                  hovered={hovered}
                  key={ringKey}
                  opacity={r.opacity}
                  ringIndex={i}
                  totalRings={layers}
                />
              );
            })}
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

function VRing({
  d,
  color,
  fill,
  opacity,
  hovered,
  ringIndex,
  totalRings,
}: {
  d: string;
  color: string;
  fill?: string;
  opacity: number;
  hovered: boolean;
  ringIndex: number;
  totalRings: number;
}) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;

  return (
    <motion.path
      animate={{ scaleX: hovered ? extraScale : 1 }}
      d={d}
      fill={fill ?? color}
      opacity={opacity}
      style={{ transformOrigin: "center center" }}
      transition={{
        type: "spring",
        stiffness: 300 - ringIndex * 60,
        damping: 24 - ringIndex * 3,
      }}
    />
  );
}

function VSegment({
  index,
  normStart,
  normEnd,
  segH,
  fullW,
  color,
  layers,
  staggerDelay,
  enterTransition,
  hovered,
  dimmed,
  renderPattern,
  straight,
  gradientStops,
}: {
  index: number;
  normStart: number;
  normEnd: number;
  segH: number;
  fullW: number;
  color: string;
  layers: number;
  staggerDelay: number;
  enterTransition?: Transition;
  hovered: boolean;
  dimmed: boolean;
  renderPattern?: (id: string, color: string) => ReactNode;
  straight: boolean;
  gradientStops?: FunnelGradientStop[];
}) {
  const patternId = `funnel-v-pattern-${index}`;
  const gradientId = `funnel-v-grad-${index}`;
  const mountProgress = useMountProgress(
    enterTransition,
    index * staggerDelay,
    index
  );
  const enterComplete = useEnterComplete(mountProgress);
  const entranceScaleY = useTransform(mountProgress, [0, 1], [0, 1]);
  const entranceScaleX = useTransform(mountProgress, [0, 1], [0, 1]);

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35;
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65;
    return {
      d: vSegmentPath(normStart, normEnd, segH, fullW, scale, straight),
      opacity,
    };
  });

  return (
    <motion.div
      animate={{ opacity: dimmed ? 0.4 : 1 }}
      className="pointer-events-none relative shrink-0 overflow-visible"
      style={{
        width: fullW,
        height: segH,
        zIndex: hovered ? 10 : 1,
      }}
      transition={{ opacity: { duration: 0.15 } }}
    >
      {enterComplete ? (
        <div className="absolute inset-0 overflow-visible">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            role="presentation"
            viewBox={`0 0 ${fullW} ${segH}`}
          >
            <defs>
              {gradientStops && (
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  {gradientStops.map((stop) => (
                    <stop
                      key={`${stop.offset}-${stop.color}`}
                      offset={
                        typeof stop.offset === "number"
                          ? `${stop.offset * 100}%`
                          : stop.offset
                      }
                      stopColor={stop.color}
                    />
                  ))}
                </linearGradient>
              )}
              {renderPattern?.(patternId, color)}
            </defs>
            {rings.map((r, i) => {
              const isInnermost = i === rings.length - 1;
              let ringFill: string | undefined;
              if (isInnermost && renderPattern) {
                ringFill = `url(#${patternId})`;
              } else if (isInnermost && gradientStops) {
                ringFill = `url(#${gradientId})`;
              }
              const ringKey = `v-ring-${r.opacity.toFixed(2)}`;
              return (
                <VRing
                  color={color}
                  d={r.d}
                  fill={ringFill}
                  hovered={hovered}
                  key={ringKey}
                  opacity={r.opacity}
                  ringIndex={i}
                  totalRings={layers}
                />
              );
            })}
          </svg>
        </div>
      ) : (
        <motion.div
          className="absolute inset-0 overflow-visible"
          style={{
            scaleY: entranceScaleY,
            scaleX: entranceScaleX,
            transformOrigin: "center top",
          }}
        >
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
            role="presentation"
            viewBox={`0 0 ${fullW} ${segH}`}
          >
            <defs>
              {gradientStops && (
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  {gradientStops.map((stop) => (
                    <stop
                      key={`${stop.offset}-${stop.color}`}
                      offset={
                        typeof stop.offset === "number"
                          ? `${stop.offset * 100}%`
                          : stop.offset
                      }
                      stopColor={stop.color}
                    />
                  ))}
                </linearGradient>
              )}
              {renderPattern?.(patternId, color)}
            </defs>
            {rings.map((r, i) => {
              const isInnermost = i === rings.length - 1;
              let ringFill: string | undefined;
              if (isInnermost && renderPattern) {
                ringFill = `url(#${patternId})`;
              } else if (isInnermost && gradientStops) {
                ringFill = `url(#${gradientId})`;
              }
              const ringKey = `v-ring-${r.opacity.toFixed(2)}`;
              return (
                <VRing
                  color={color}
                  d={r.d}
                  fill={ringFill}
                  hovered={hovered}
                  key={ringKey}
                  opacity={r.opacity}
                  ringIndex={i}
                  totalRings={layers}
                />
              );
            })}
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Label Overlays ─────────────────────────────────────────────────

function SegmentLabel({
  stage,
  pct,
  isHorizontal,
  showValues,
  showPercentage,
  showLabels,
  formatPercentage,
  formatValue,
  index,
  staggerDelay,
  layout = "spread",
  orientation,
  align = "center",
}: {
  stage: FunnelStage;
  pct: number;
  isHorizontal: boolean;
  showValues: boolean;
  showPercentage: boolean;
  showLabels: boolean;
  formatPercentage: (p: number) => string;
  formatValue: (v: number) => string;
  index: number;
  staggerDelay: number;
  layout?: "spread" | "grouped";
  orientation?: "vertical" | "horizontal";
  align?: "center" | "start" | "end";
}) {
  const display = stage.displayValue ?? formatValue(stage.value);

  const valueEl = showValues && (
    <span className="whitespace-nowrap font-bold text-foreground text-xs sm:text-sm font-heading tracking-tight drop-shadow-2xs">
      {display}
    </span>
  );
  const pctEl = showPercentage && (
    <span className="rounded-full bg-card/95 text-foreground border border-border/80 px-2.5 sm:px-3 py-0.5 sm:py-1 font-bold text-[10px] sm:text-xs shadow-xs backdrop-blur-xs select-none">
      {formatPercentage(pct)}
    </span>
  );
  const labelEl = showLabels && (
    <span className="whitespace-nowrap font-semibold text-muted-foreground text-[10px] sm:text-xs">
      {stage.label}
    </span>
  );

  // Spread layout (default): items distributed across height/width
  if (layout === "spread") {
    return (
      <motion.div
        animate={{ opacity: 1 }}
        className={cn(
          "absolute inset-0 flex",
          isHorizontal ? "flex-col items-center justify-between py-2 sm:py-3" : "flex-row items-center justify-between px-2 sm:px-3"
        )}
        initial={{ opacity: 0 }}
        transition={{
          delay: index * staggerDelay + 0.25,
          duration: 0.35,
          ease: "easeOut",
        }}
      >
        {isHorizontal ? (
          <>
            <div className="flex h-[20%] items-center justify-center">
              {valueEl}
            </div>
            <div className="flex flex-1 items-center justify-center my-1">
              {pctEl}
            </div>
            <div className="flex h-[20%] items-center justify-center">
              {labelEl}
            </div>
          </>
        ) : (
          <>
            <div className="flex w-[25%] items-center justify-end pr-2">
              {valueEl}
            </div>
            <div className="flex flex-1 items-center justify-center">
              {pctEl}
            </div>
            <div className="flex w-[25%] items-center justify-start pl-2">
              {labelEl}
            </div>
          </>
        )}
      </motion.div>
    );
  }

  // Grouped layout: items stacked together
  const resolvedOrientation =
    orientation ?? (isHorizontal ? "vertical" : "horizontal");
  const isVerticalStack = resolvedOrientation === "vertical";

  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  } as const;
  const itemsMap = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
  } as const;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(
        "absolute inset-0 flex",
        isHorizontal
          ? cn("flex-col items-center", justifyMap[align])
          : cn("flex-row items-center", justifyMap[align])
      )}
      initial={{ opacity: 0 }}
      style={{
        padding: isHorizontal ? "8% 0" : "0 8%",
      }}
      transition={{
        delay: index * staggerDelay + 0.25,
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      <div
        className={cn(
          "flex gap-1.5",
          isVerticalStack
            ? cn("flex-col", itemsMap[isHorizontal ? "center" : align])
            : cn("flex-row", itemsMap.center)
        )}
      >
        {valueEl}
        {pctEl}
        {labelEl}
      </div>
    </motion.div>
  );
}

// ─── Main FunnelChart Component ─────────────────────────────────────

export function FunnelChart({
  data,
  orientation = "horizontal",
  color = "var(--foreground)",
  layers = 3,
  className,
  style,
  showPercentage = true,
  showValues = true,
  showLabels = true,
  hoveredIndex: hoveredIndexProp,
  onHoverChange,
  formatPercentage = fmtPct,
  formatValue = fmtVal,
  staggerDelay = 0.12,
  enterTransition,
  gap = 4,
  renderPattern,
  edges = "curved",
  labelLayout = "spread",
  labelOrientation,
  labelAlign = "center",
  grid: gridProp = false,
}: FunnelChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null);

  const isControlled = hoveredIndexProp !== undefined;
  const hoveredIndex = isControlled ? hoveredIndexProp : internalHoveredIndex;
  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled) {
        onHoverChange?.(index);
      } else {
        setInternalHoveredIndex(index);
      }
    },
    [isControlled, onHoverChange]
  );

  const measure = useCallback(() => {
    if (!ref.current) return;
    const { width: w, height: h } = ref.current.getBoundingClientRect();
    if (w > 0 && h > 0) {
      setSz({ w, h });
    }
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) {
      ro.observe(ref.current);
    }
    return () => ro.disconnect();
  }, [measure]);

  if (!data || !data.length) {
    return null;
  }

  const first = data[0];
  if (!first) {
    return null;
  }
  const max = Math.max(first.value, ...data.map((d) => d.value), 1);
  const n = data.length;
  const norms = data.map((d) => Math.max(d.value / max, 0.08));
  const horiz = orientation === "horizontal";
  const { w: W, h: H } = sz;

  const totalGap = gap * (n - 1);
  const segW = (W - (horiz ? totalGap : 0)) / n;
  const segH = (H - (horiz ? 0 : totalGap)) / n;

  // Resolve grid config
  const gridEnabled = gridProp !== false;
  const gridCfg = typeof gridProp === "object" ? gridProp : {};
  const showBands = gridEnabled && (gridCfg.bands ?? true);
  const bandColor = gridCfg.bandColor ?? "var(--color-muted)";
  const showGridLines = gridEnabled && (gridCfg.lines ?? true);
  const gridLineColor = gridCfg.lineColor ?? "var(--chart-grid)";
  const gridLineOpacity = gridCfg.lineOpacity ?? 1;
  const gridLineWidth = gridCfg.lineWidth ?? 1;

  return (
    <div
      className={cn("relative w-full h-full select-none overflow-visible min-h-[160px]", className)}
      ref={ref}
      style={{
        ...style,
      }}
    >
      {W > 0 && H > 0 && (
        <>
          {/* Grid layer: background bands + grid lines */}
          {gridEnabled && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${W} ${H}`}
            >
              {showBands &&
                data.map((stage, i) => {
                  if (i % 2 !== 0) return null;
                  if (horiz) {
                    const x = (segW + gap) * i;
                    return (
                      <rect
                        fill={bandColor}
                        height={H}
                        key={`band-${stage.label}`}
                        width={segW}
                        x={x}
                        y={0}
                      />
                    );
                  }
                  const y = (segH + gap) * i;
                  return (
                    <rect
                      fill={bandColor}
                      height={segH}
                      key={`band-${stage.label}`}
                      width={W}
                      x={0}
                      y={y}
                    />
                  );
                })}
            </svg>
          )}

          {/* Segments container — overflow-visible so hover scale is not clipped */}
          <div
            className={cn(
              "absolute inset-0 flex overflow-visible",
              horiz ? "flex-row" : "flex-col"
            )}
            style={{ gap }}
          >
            {data.map((stage, i) => {
              const normStart = norms[i] ?? 0;
              const normEnd = norms[Math.min(i + 1, n - 1)] ?? 0;
              const firstStop = stage.gradient?.[0];
              const segColor = firstStop
                ? firstStop.color
                : (stage.color ?? color);

              return horiz ? (
                <HSegment
                  color={segColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  enterTransition={enterTransition}
                  fullH={H}
                  gradientStops={stage.gradient}
                  hovered={hoveredIndex === i}
                  index={i}
                  key={stage.label}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  renderPattern={renderPattern}
                  segW={segW}
                  staggerDelay={staggerDelay}
                  straight={edges === "straight"}
                />
              ) : (
                <VSegment
                  color={segColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  enterTransition={enterTransition}
                  fullW={W}
                  gradientStops={stage.gradient}
                  hovered={hoveredIndex === i}
                  index={i}
                  key={stage.label}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  renderPattern={renderPattern}
                  segH={segH}
                  staggerDelay={staggerDelay}
                  straight={edges === "straight"}
                />
              );
            })}
          </div>

          {/* Grid lines */}
          {gridEnabled && showGridLines && (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              role="presentation"
              viewBox={`0 0 ${W} ${H}`}
            >
              {Array.from({ length: n - 1 }, (_, i) => {
                const idx = i + 1;
                const gridKey = `grid-${idx}`;
                if (horiz) {
                  const x = segW * idx + gap * i + gap / 2;
                  return (
                    <line
                      key={gridKey}
                      stroke={gridLineColor}
                      strokeOpacity={gridLineOpacity}
                      strokeWidth={gridLineWidth}
                      x1={x}
                      x2={x}
                      y1={0}
                      y2={H}
                    />
                  );
                }
                const y = segH * idx + gap * i + gap / 2;
                return (
                  <line
                    key={gridKey}
                    stroke={gridLineColor}
                    strokeOpacity={gridLineOpacity}
                    strokeWidth={gridLineWidth}
                    x1={0}
                    x2={W}
                    y1={y}
                    y2={y}
                  />
                );
              })}
            </svg>
          )}

          {/* Label overlays — hover triggers for each segment */}
          {data.map((stage, i) => {
            const pct = (stage.value / max) * 100;
            const posStyle: CSSProperties = horiz
              ? {
                  left: (segW + gap) * i,
                  width: segW,
                  top: 0,
                  height: H,
                }
              : {
                  top: (segH + gap) * i,
                  height: segH,
                  left: 0,
                  width: W,
                };

            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;

            return (
              <motion.div
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                className="absolute cursor-pointer"
                key={`lbl-${stage.label}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ ...posStyle, zIndex: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              >
                <SegmentLabel
                  align={labelAlign}
                  formatPercentage={formatPercentage}
                  formatValue={formatValue}
                  index={i}
                  isHorizontal={horiz}
                  layout={labelLayout}
                  orientation={labelOrientation}
                  pct={pct}
                  showLabels={showLabels}
                  showPercentage={showPercentage}
                  showValues={showValues}
                  stage={stage}
                  staggerDelay={staggerDelay}
                />
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default FunnelChart;
