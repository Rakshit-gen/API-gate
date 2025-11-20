"use client";

import React, { useEffect, useState, memo, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Activity,
  Shield,
  Zap,
  Database,
  Gauge,
  BarChart3,
  ArrowRight,
  Globe,
  Sparkles,
  TrendingUp,
  Infinity,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Optimized scroll reveal with GPU acceleration
const FadeInOnScroll = memo(function FadeInOnScroll({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
});

// Performance-optimized feature card with GPU acceleration
const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  iconGradient,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  iconGradient: string;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <FadeInOnScroll delay={index * 0.08}>
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="group relative h-full"
        style={{ willChange: "transform" }}
      >
        <Card className="relative h-full overflow-hidden border border-slate-800/50 bg-gradient-to-b from-slate-950/90 to-slate-950 backdrop-blur-xl transition-all duration-300 hover:border-slate-700/50">
          {/* Animated gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 blur-2xl transition-opacity duration-500`}
            animate={{ opacity: isHovered ? 0.3 : 0 }}
            style={{ willChange: "opacity" }}
          />
          
          <div className="relative p-6">
            {/* Icon with rotation animation */}
            <motion.div
              className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${iconGradient} shadow-lg`}
              animate={{ 
                rotate: isHovered ? 5 : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{ willChange: "transform" }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            
            <h3 className="mb-2 text-lg font-semibold text-slate-50">{title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{description}</p>
          </div>
        </Card>
      </motion.div>
    </FadeInOnScroll>
  );
});

// Animated stats counter
const AnimatedStat = memo(function AnimatedStat({
  value,
  label,
  icon: Icon,
  gradient,
  iconColor,
  animationDelay = 0,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
  animationDelay?: number;
}) {
  return (
    <FadeInOnScroll delay={animationDelay}>
      <motion.div
        className="text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </motion.div>
        <motion.div
          className={`mb-1 bg-gradient-to-r ${gradient.replace("/20", "").replace("/10", "")} bg-clip-text text-4xl font-bold text-transparent`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: animationDelay + 0.2, duration: 0.5 }}
        >
          {value}
        </motion.div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      </motion.div>
    </FadeInOnScroll>
  );
});

// Interactive floating particles
const FloatingParticle = memo(function FloatingParticle({ delay }: { delay: number }) {
  const [mounted, setMounted] = useState(false);
  const startY = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080));
  const startX = useRef(Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920));
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-sky-400/40"
      initial={{ 
        x: startX.current,
        y: startY.current,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        y: startY.current - 100,
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: -1,
        ease: "easeOut",
      }}
      style={{ willChange: "transform, opacity" }}
    />
  );
});

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized scroll tracking
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, { stiffness: 100, damping: 30 });
  
  // Parallax transforms with GPU acceleration
  const heroY = useTransform(smoothScrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(smoothScrollY, [0, 300], [1, 0.3]);
  const featuresY = useTransform(smoothScrollY, [200, 800], [0, -50]);

  // Throttled mouse tracking for performance
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Memoized features data
  const features = useMemo(() => [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency routing with intelligent connection reuse.",
      gradient: "from-sky-500/20 via-cyan-400/10 to-blue-600/10",
      iconGradient: "from-sky-500 via-cyan-400 to-blue-500",
    },
    {
      icon: Shield,
      title: "Secure by Default",
      description: "mTLS, JWT validation, and WAF presets out of the box.",
      gradient: "from-emerald-500/20 via-teal-400/10 to-slate-900/40",
      iconGradient: "from-emerald-500 via-teal-400 to-emerald-400",
    },
    {
      icon: Gauge,
      title: "Adaptive Rate Limiting",
      description: "Dynamic limits per key, tenant, or any dimension.",
      gradient: "from-violet-500/20 via-fuchsia-500/10 to-slate-900/40",
      iconGradient: "from-violet-500 via-fuchsia-500 to-indigo-400",
    },
    {
      icon: Database,
      title: "Smart Caching",
      description: "Full control over cache keys with automatic invalidation.",
      gradient: "from-emerald-500/20 via-emerald-300/10 to-slate-900/40",
      iconGradient: "from-emerald-400 via-lime-400 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Live Observability",
      description: "Real-time dashboards with latency heatmaps and alerts.",
      gradient: "from-sky-500/20 via-indigo-500/15 to-slate-900/40",
      iconGradient: "from-sky-400 via-indigo-400 to-cyan-400",
    },
    {
      icon: Globe,
      title: "Global Edge",
      description: "Terminate at the closest POP with automatic failover.",
      gradient: "from-cyan-400/20 via-teal-400/10 to-slate-900/40",
      iconGradient: "from-cyan-400 via-teal-400 to-sky-400",
    },
  ], []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Optimized background grid */}
      <div 
        className="pointer-events-none fixed inset-0 -z-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
          willChange: "transform",
        }}
      />

      {/* Animated gradient orbs with GPU acceleration */}
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute h-[600px] w-[600px] rounded-full bg-sky-500/15 blur-[140px]"
          style={{
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
            willChange: "transform",
          }}
          transition={{ type: "spring", stiffness: 50, damping: 40, mass: 0.5 }}
        />
        <motion.div
          className="absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full bg-blue-700/20 blur-[140px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 8, repeat: -1, ease: "easeInOut" }}
          style={{ willChange: "transform, opacity" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[140px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: -1, ease: "easeInOut" }}
          style={{ willChange: "transform, opacity" }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Navigation with scroll effect */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors ${
          isScrolled 
            ? "border-slate-800/80 bg-slate-950/90" 
            : "border-slate-800/50 bg-slate-950/70"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 opacity-70 blur-sm" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-500 shadow-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </motion.div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-50">Apex Gateway</p>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Rate Limiter
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    className="text-xs font-medium uppercase tracking-wider text-slate-300 hover:text-slate-50"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="group relative overflow-hidden bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg">
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </motion.div>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-50 ring-1 ring-slate-700/80 hover:bg-slate-800">
                      Dashboard
                    </Button>
                  </motion.div>
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with parallax */}
      <section className="relative px-4 pb-32 pt-20 sm:px-6 lg:px-8">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto max-w-5xl"
        >
          <FadeInOnScroll>
            <div className="relative mx-auto max-w-4xl text-center">
              {/* Animated badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/70 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-slate-300 backdrop-blur"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: -1, ease: "linear" }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                </motion.div>
                <span>High-Performance Edge</span>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: -1 }}
                  className="h-1 w-1 rounded-full bg-emerald-400"
                />
                <span>Zero-Config</span>
              </motion.div>

              {/* Animated heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
              >
                <span className="block text-slate-200">Ship APIs like a</span>
                <motion.span
                  className="block bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0%", "100%"],
                  }}
                  transition={{ duration: 3, repeat: -1, repeatType: "reverse" }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  world-class platform.
                </motion.span>
              </motion.h1>

              {/* Minimal subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mx-auto mb-10 max-w-xl text-base text-slate-400"
              >
                Enterprise-grade API edge: rate limiting, caching, auth, and observability.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <SignedOut>
                  <SignInButton mode="modal">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        className="group relative h-12 overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 px-8 text-xs font-semibold uppercase tracking-wider text-white shadow-xl"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Start Free
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </motion.div>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="lg"
                        className="h-12 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 px-8 text-xs font-semibold uppercase tracking-wider text-white shadow-xl"
                      >
                        Go to Dashboard
                      </Button>
                    </motion.div>
                  </Link>
                </SignedIn>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="group h-12 rounded-full border border-slate-700 bg-slate-950/70 px-7 text-xs font-semibold uppercase tracking-wider text-slate-200 backdrop-blur hover:border-slate-300"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Minimal metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: -1 }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  <span>&lt; 10 min setup</span>
                </div>
                <div className="h-4 w-px bg-slate-700/80" />
                <div className="flex items-center gap-2">
                  <Infinity className="h-3.5 w-3.5 text-sky-400" />
                  <span>Millions RPS</span>
                </div>
                <div className="h-4 w-px bg-slate-700/80" />
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Zero downtime</span>
                </div>
              </motion.div>
            </div>
          </FadeInOnScroll>

          {/* Interactive code preview */}
          <FadeInOnScroll delay={0.3}>
            <motion.div
              whileHover={{ y: -8, scale: 1.01 }}
              className="mx-auto mt-16 max-w-3xl"
            >
              <Card className="relative overflow-hidden border border-slate-800/50 bg-gradient-to-b from-slate-950/90 to-slate-950 backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/90" />
                <div className="relative flex items-center gap-2 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <p className="ml-3 text-[11px] text-slate-400">apex-gateway.dev</p>
                </div>
                <CardContent className="border-t border-slate-800/50 bg-slate-950/50 p-6">
                  <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                    <code>{`route "api" {
  backend = "https://api.internal"
  limits { per_key = "1000/min" }
}

$ apex apply
✓ deployed in 142ms`}</code>
                  </pre>
                </CardContent>
              </Card>
            </motion.div>
          </FadeInOnScroll>
        </motion.div>
      </section>

      {/* Features Section with parallax */}
      <motion.section
        style={{ y: featuresY }}
        className="relative px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto max-w-7xl">
          <FadeInOnScroll>
            <div className="mb-16 text-center">
              <motion.div
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-300"
              >
                <TrendingUp className="h-3 w-3 text-sky-400" />
                <span>Platform-grade primitives</span>
              </motion.div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
                Everything your edge needs.
              </h2>
            </div>
          </FadeInOnScroll>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} index={index} {...feature} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="relative border-y border-slate-800/50 bg-gradient-to-b from-slate-950/80 to-slate-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            <AnimatedStat
              value="99.99%"
              label="Uptime"
              icon={Infinity}
              gradient="from-sky-500/20 via-cyan-500/10 to-blue-600/20"
              iconColor="text-sky-400"
              animationDelay={0}
            />
            <AnimatedStat
              value="&lt; 10ms"
              label="Overhead"
              icon={Zap}
              gradient="from-violet-500/20 via-fuchsia-500/10 to-pink-500/20"
              iconColor="text-violet-300"
              animationDelay={0.1}
            />
            <AnimatedStat
              value="1M+"
              label="RPS"
              icon={Activity}
              gradient="from-emerald-500/20 via-teal-500/10 to-emerald-500/20"
              iconColor="text-emerald-300"
              animationDelay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Minimal CTA */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
          <FadeInOnScroll>
            <Card className="relative overflow-hidden border border-slate-800/50 bg-gradient-to-br from-slate-950/95 to-slate-950 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_60%)] opacity-50" />
              <CardContent className="relative p-12 text-center">
                <h2 className="mb-4 text-3xl font-bold text-slate-50">
                  Ready to scale?
                </h2>
                <p className="mb-8 text-slate-400">
                  Start free, scale to millions.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          className="h-11 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 px-8 text-xs font-semibold uppercase tracking-wider text-white"
                        >
                          Start Free Trial
                        </Button>
                      </motion.div>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="lg"
                          className="h-11 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 px-8 text-xs font-semibold uppercase tracking-wider text-white"
                        >
                          Go to Dashboard
                        </Button>
                      </motion.div>
                    </Link>
                  </SignedIn>
                </div>
              </CardContent>
            </Card>
          </FadeInOnScroll>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative border-t border-slate-800/50 bg-slate-950/95 px-4 py-12 text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 opacity-60 blur-sm" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-500">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-50">Apex Gateway</h3>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Rate Limiter
                </p>
              </div>
            </div>
            <div className="flex gap-8 text-xs">
              <Link href="/dashboard" className="hover:text-slate-100 transition-colors">
                Dashboard
              </Link>
              <Link href="/dashboard/routes" className="hover:text-slate-100 transition-colors">
                Routes
              </Link>
              <Link href="/dashboard/analytics" className="hover:text-slate-100 transition-colors">
                Analytics
              </Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800/50 pt-4 text-center text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Apex Gateway. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
