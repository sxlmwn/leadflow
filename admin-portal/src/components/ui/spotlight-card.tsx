'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

// Context for sibling dimming within a logical group of cards
interface SpotlightGroupContextType {
  hoveredCardId: string | null;
  setHoveredCardId: (id: string | null) => void;
}

const SpotlightGroupContext = createContext<SpotlightGroupContextType>({
  hoveredCardId: null,
  setHoveredCardId: () => {},
});

export interface SpotlightCardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCardGroup: React.FC<SpotlightCardGroupProps> = ({
  children,
  className = '',
  ...props
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  return (
    <SpotlightGroupContext.Provider value={{ hoveredCardId, setHoveredCardId }}>
      <div className={className} {...props}>
        {children}
      </div>
    </SpotlightGroupContext.Provider>
  );
};

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  id?: string;
  color?: string; // Semantic/accent color (e.g. #2563eb, #10b981, #f59e0b, #6366f1)
  tiltMax?: number;
  enableTilt?: boolean;
  enableGlow?: boolean;
  enableShimmer?: boolean;
  enableBottomLine?: boolean;
  dimScale?: number;
  dimOpacity?: number;
}

const TILT_SPRING = { stiffness: 320, damping: 30 } as const;
const GLOW_SPRING = { stiffness: 200, damping: 24 } as const;

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  id,
  color = '#2563eb',
  tiltMax = 6,
  enableTilt = true,
  enableGlow = true,
  enableShimmer = true,
  enableBottomLine = true,
  dimScale = 0.97,
  dimOpacity = 0.65,
  ...props
}) => {
  const generatedId = React.useId();
  const cardId = id || generatedId;
  const { hoveredCardId, setHoveredCardId } = useContext(SpotlightGroupContext);
  const isDimmed = hoveredCardId !== null && hoveredCardId !== cardId;

  const cardRef = useRef<HTMLDivElement>(null);
  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);

  const rawRotateX = useTransform(normY, [0, 1], [tiltMax, -tiltMax]);
  const rawRotateY = useTransform(normX, [0, 1], [-tiltMax, tiltMax]);
  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt && !enableGlow) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    setHoveredCardId(cardId);
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    setHoveredCardId(null);
  };

  return (
    <motion.div
      ref={cardRef}
      animate={{
        scale: isDimmed ? dimScale : 1,
        opacity: isDimmed ? dimOpacity : 1,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformPerspective: 1000,
      }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 text-card-foreground shadow-xs transition-colors duration-300 hover:border-border dark:hover:border-white/20',
        className
      )}
      {...(props as any)}
    >
      {/* 1. Ambient Background Aurora Glow (Always subtle) */}
      {enableGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at 25% 20%, ${color}12, transparent 70%)`,
          }}
        />
      )}

      {/* 2. Magnetic Interactive Aurora Glow on Hover */}
      {enableGlow && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{
            opacity: glowOpacity,
            background: `radial-gradient(ellipse at 25% 20%, ${color}28, transparent 70%)`,
          }}
        />
      )}

      {/* 3. Shimmer Sweep Across Card on Hover */}
      {enableShimmer && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[55%] -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/10 dark:via-white/5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
        />
      )}

      {/* Card Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* 4. Animated Bottom Accent Line Filling on Hover */}
      {enableBottomLine && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2.5px] w-0 rounded-full transition-all duration-500 ease-out group-hover:w-full z-20"
          style={{
            background: `linear-gradient(to right, ${color}e6, ${color}33, transparent)`,
          }}
        />
      )}
    </motion.div>
  );
};

export default SpotlightCard;
