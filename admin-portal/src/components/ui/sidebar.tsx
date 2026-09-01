"use client";

import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";

export interface SidebarLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.aside
      className={cn(
        "h-screen sticky top-0 hidden md:flex md:flex-col bg-card border-r border-border shrink-0 select-none z-30 relative overflow-hidden transition-colors duration-200",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "72px") : "260px",
      }}
      transition={{
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.aside>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-card border-b border-border w-full",
        className
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-xl bg-secondary border border-border text-foreground hover:text-blue-500 transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              "fixed inset-0 h-full w-full max-w-xs bg-card border-r border-border p-6 z-[100] flex flex-col justify-between shadow-2xl overflow-y-auto",
              className
            )}
          >
            <div className="absolute right-5 top-5 z-50">
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive = false,
  title,
  ...props
}: {
  link: SidebarLinkItem;
  className?: string;
  isActive?: boolean;
  title?: string;
} & Omit<React.ComponentProps<typeof Link>, "href">) => {
  const { open, animate } = useSidebar();
  const active = isActive || link.isActive;

  return (
    <Link
      href={link.href}
      title={title}
      className={cn(
        "flex items-center gap-3.5 group/sidebar px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer overflow-hidden",
        active
          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/50 shadow-2xs"
          : "text-muted-foreground hover:bg-secondary dark:hover:bg-neutral-900 hover:text-foreground border border-transparent",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-5 h-5 shrink-0 transition-transform duration-200 flex items-center justify-center group-hover/sidebar:scale-110",
          active ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground group-hover/sidebar:text-foreground"
        )}
      >
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.18,
          ease: "easeInOut",
        }}
        className="truncate font-medium text-sm group-hover/sidebar:translate-x-1 transition-transform duration-200 whitespace-pre !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
