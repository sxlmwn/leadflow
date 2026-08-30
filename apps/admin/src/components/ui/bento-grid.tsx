import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon?: any;
  description?: string;
  href?: string;
  cta?: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl transition-all duration-250 ease-in-out",
      "bg-card border border-border shadow-xs",
      "hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 dark:hover:shadow-[0_0_20px_2px_rgba(59,130,246,0.15)]",
      "transform-gpu hover:-translate-y-0.5",
      className,
    )}
  >
    {background && <div>{background}</div>}
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-250 group-hover:-translate-y-2">
      {Icon && (
        <Icon className="h-8 w-8 origin-left transform-gpu text-blue-600 dark:text-blue-400 transition-all duration-250 ease-in-out group-hover:scale-95 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
      )}
      <h3 className="text-lg font-bold text-foreground font-heading">
        {name}
      </h3>
      {description && <p className="max-w-lg text-muted-foreground text-sm leading-relaxed">{description}</p>}
    </div>

    {href && cta && (
      <div
        className="pointer-events-none absolute bottom-0 flex w-full translate-y-6 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-250 group-hover:translate-y-0 group-hover:opacity-100"
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-250 group-hover:bg-blue-500/[0.02] dark:group-hover:bg-blue-500/[0.04]" />
  </div>
);

export { BentoCard, BentoGrid };
