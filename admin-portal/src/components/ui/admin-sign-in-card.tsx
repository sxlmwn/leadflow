'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Mail, Lock, Eye, EyeClosed, ArrowRight, Activity, Sun, Moon } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { createClient } from '@/lib/supabase/client';
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-neutral-500 shadow-2xs transition-all duration-200 outline-none",
        "focus:bg-white dark:focus:bg-black focus:border-foreground focus:ring-2 focus:ring-foreground/10",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export function AdminSignInCard() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const savedTheme = localStorage.getItem('leadflow_admin_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('leadflow_admin_theme', 'light');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('leadflow_admin_theme', 'dark');
    }
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable tilt on touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-black relative overflow-x-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Quick Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-5 right-5 p-2.5 rounded-xl bg-card hover:bg-secondary text-foreground border border-border transition-colors cursor-pointer shadow-xs z-20"
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1200 }}
      >
        <motion.div className="relative" style={{ rotateX, rotateY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} whileHover={{ z: 8 }}>
          <div className="relative group">
            {/* Subtle card glow border */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-zinc-400/20 via-zinc-500/20 to-zinc-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white/95 dark:bg-[#0a0a0a] backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-slate-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden">
              <div className="text-center space-y-1 mb-6">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="mx-auto w-12 h-12 rounded-2xl bg-card border border-border text-foreground flex items-center justify-center shadow-md mb-3 font-bold"
                >
                  <Activity className="w-6 h-6 text-foreground" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading"
                >
                  Lead<span className="text-zinc-500 dark:text-zinc-400">Flow</span> Admin
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                  Sign in to the Enterprise Lead Management Portal
                </motion.p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${focusedInput === "email" ? 'text-foreground' : 'text-slate-500 dark:text-slate-400'}`} />
                  <Input
                    type="email" placeholder="admin@leadflow.io" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedInput("email")} onBlur={() => setFocusedInput(null)}
                    className="pl-10 pr-3 min-h-[42px]"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${focusedInput === "password" ? 'text-foreground' : 'text-slate-500 dark:text-slate-400'}`} />
                  <Input
                    type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedInput("password")} onBlur={() => setFocusedInput(null)}
                    className="pl-10 pr-10 min-h-[42px]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 rounded border-border dark:border-neutral-700 accent-foreground cursor-pointer"
                    />
                    Remember me
                  </label>
                  <Link href="/login" className="text-xs text-slate-600 dark:text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  type="submit" disabled={isLoading}
                  className="w-full relative mt-5 cursor-pointer"
                >
                  <div className="relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 font-bold h-10 rounded-xl transition-colors duration-200 flex items-center justify-center shadow-md">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
                          <Loader
                            size="sm"
                            title="Authenticating..."
                            subtitle=""
                            className="p-0 gap-1.5 flex-row text-white dark:text-zinc-900 [&_h1]:text-white dark:[&_h1]:text-zinc-900 [&_h1]:text-xs [&_div]:size-4 [&_span]:text-white dark:[&_span]:text-zinc-900"
                          />
                        </motion.div>
                      ) : (
                        <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-sm font-semibold">
                          Sign In <ArrowRight className="w-4 h-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>

              <div className="mt-6 pt-4 border-t border-border dark:border-neutral-800 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Protected with Supabase Authentication &amp; RBAC Policy
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
