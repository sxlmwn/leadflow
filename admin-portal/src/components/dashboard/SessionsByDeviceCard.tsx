'use client';

import React from 'react';
import { MoreHorizontal, Laptop, Smartphone, Tablet } from 'lucide-react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface SessionsByDeviceCardProps {
  title?: string;
  totalVisitors?: number;
  desktopCount?: number;
  mobileCount?: number;
  tabletCount?: number;
  breakdowns?: Array<{
    device: string;
    percentage: number;
    count?: number | string;
    icon: any;
    color: string;
  }>;
}

const chartConfig = {
  visitors: {
    label: "Total Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "#18181b",
  },
} satisfies ChartConfig;

export const SessionsByDeviceCard: React.FC<SessionsByDeviceCardProps> = ({
  title = "Sessions by device",
  totalVisitors = 0,
  desktopCount = 0,
  mobileCount = 0,
  tabletCount = 0,
  breakdowns: customBreakdowns,
}) => {
  const tot = totalVisitors || 0;
  const dCount = desktopCount || 0;
  const mCount = mobileCount || 0;
  const tCount = tabletCount || 0;

  const dPct = tot > 0 ? Math.round((dCount / tot) * 1000) / 10 : 0;
  const mPct = tot > 0 ? Math.round((mCount / tot) * 1000) / 10 : 0;
  const tPct = tot > 0 ? Math.round((tCount / tot) * 1000) / 10 : 0;

  const breakdowns = customBreakdowns ?? [
    {
      device: 'Desktop',
      percentage: dPct,
      count: dCount.toLocaleString(),
      icon: Laptop,
      color: 'text-foreground',
    },
    {
      device: 'Mobile',
      percentage: mPct,
      count: mCount.toLocaleString(),
      icon: Smartphone,
      color: 'text-zinc-600 dark:text-zinc-400',
    },
    {
      device: 'Tablet',
      percentage: tPct,
      count: tCount.toLocaleString(),
      icon: Tablet,
      color: 'text-zinc-400 dark:text-zinc-500',
    },
  ];

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

  const chartData = [
    { device: 'visitors', visitors: tot > 0 ? tot : 1, fill: isDark ? '#ffffff' : '#18181b' },
  ];

  const endAngle = tot > 0 ? 282 : 0;

  return (
    <SpotlightCard
      color="#71717a"
      tiltMax={5}
      className="p-4 sm:p-6 flex flex-col justify-between h-full group"
    >
      {/* Card Header matching 1.jpg */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium">
            Traffic distribution by client platform
          </p>
        </div>
        <button
          type="button"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* shadcn Radial Chart - Text (Exact Pattern) */}
      <div className="my-auto py-2 flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-h-[190px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            outerRadius={88}
            innerRadius={74}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted/20 last:fill-background"
              polarRadius={[88, 74]}
            />
            <RadialBar
              dataKey="visitors"
              background={{ fill: isDark ? '#27272a' : '#e2e8f0' }}
              className="fill-zinc-900 dark:fill-white [&_.recharts-radial-bar-background-sector]:fill-zinc-200/90 dark:[&_.recharts-radial-bar-background-sector]:fill-zinc-800/90"
              cornerRadius={10}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const numStr =
                      typeof totalVisitors === 'number'
                        ? totalVisitors.toLocaleString()
                        : String(totalVisitors);

                    const fontSize =
                      numStr.length > 7
                        ? '18px'
                        : numStr.length > 5
                        ? '22px'
                        : '28px';

                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 5}
                          style={{ fontSize }}
                          className="fill-foreground font-extrabold font-heading tracking-tight"
                        >
                          {numStr}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-xs font-semibold"
                        >
                          Total visitors
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

      {/* Breakdown List Rows matching 1.jpg */}
      <div className="mt-2 pt-3 border-t border-border/70 space-y-2">
        {breakdowns.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.device}
              className="flex items-center justify-between text-xs py-0.5 hover:bg-secondary/40 px-1 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${b.color} shrink-0`} />
                <span className="text-xs font-semibold text-foreground">{b.device}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                {b.count && (
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    {b.count}
                  </span>
                )}
                <span className="text-xs font-bold text-foreground">{b.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </SpotlightCard>
  );
};

export default SessionsByDeviceCard;
