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
  totalVisitors?: number | string;
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
    color: "#2563eb",
  },
} satisfies ChartConfig;

export const SessionsByDeviceCard: React.FC<SessionsByDeviceCardProps> = ({
  title = "Sessions by device",
  totalVisitors = "10,739",
  breakdowns = [
    {
      device: 'Desktop',
      percentage: 78.5,
      count: '8,430',
      icon: Laptop,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      device: 'Mobile',
      percentage: 19.7,
      count: '2,115',
      icon: Smartphone,
      color: 'text-sky-500 dark:text-sky-400',
    },
    {
      device: 'Tablet',
      percentage: 1.8,
      count: '194',
      icon: Tablet,
      color: 'text-blue-400 dark:text-blue-300',
    },
  ]
}) => {
  const chartData = [
    { device: 'desktop', visitors: 10739, fill: '#2563eb' },
  ];

  return (
    <SpotlightCard
      color="#0ea5e9"
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
            endAngle={282}
            outerRadius={88}
            innerRadius={74}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted/40 last:fill-background"
              polarRadius={[88, 74]}
            />
            <RadialBar
              dataKey="visitors"
              background={{ fill: 'currentColor' }}
              className="[&_.recharts-radial-bar-background-sector]:fill-slate-100 dark:[&_.recharts-radial-bar-background-sector]:fill-slate-800/80"
              cornerRadius={10}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 6}
                          className="fill-foreground text-3xl sm:text-[34px] font-extrabold font-heading tracking-tight"
                        >
                          {typeof totalVisitors === 'number'
                            ? totalVisitors.toLocaleString()
                            : totalVisitors}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className="fill-muted-foreground text-xs font-semibold"
                        >
                          Total visitor
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
