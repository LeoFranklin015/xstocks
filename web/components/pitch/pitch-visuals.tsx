"use client";

import { motion, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Title slide: xSPY splits into xdSPY + xpSPY */
export function AnimSplitTokens() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-10">
      <div className="flex w-full items-center justify-center gap-3 sm:gap-5 md:gap-8">
        <motion.div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-accent/50 bg-accent/10 font-mono text-[10px] sm:text-xs"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 140, damping: 16 }}
        >
          <span className="font-medium text-accent">xdSPY</span>
        </motion.div>

        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <motion.div
            className="h-0.5 flex-1 rounded-full bg-accent/50"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
            style={{ transformOrigin: "right center" }}
          />
          <motion.div
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border-2 border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground sm:text-xs"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.55 }}
          >
            <span>xSPY</span>
            <span className="mt-0.5 text-[8px] opacity-70">vault</span>
          </motion.div>
          <motion.div
            className="h-0.5 flex-1 rounded-full bg-foreground/15"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
            style={{ transformOrigin: "left center" }}
          />
        </div>

        <motion.div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card font-mono text-[10px] text-foreground sm:text-xs"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, type: "spring", stiffness: 140, damping: 16 }}
        >
          xpSPY
        </motion.div>
      </div>

      <motion.p
        className="font-mono text-[10px] text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        income token + price token = yield stripping
      </motion.p>
    </div>
  );
}

/** Problem: bundled value bars */
export function AnimProblemBars() {
  const bars = [
    { h: 72, key: "a" },
    { h: 88, key: "b" },
    { h: 95, key: "c" },
  ];
  return (
    <div className="flex w-full max-w-md gap-6">
      <div className="flex flex-1 flex-col items-center gap-2">
        <span className="w-full text-left font-mono text-[10px] uppercase tracking-widest text-red-400/90">
          bundled
        </span>
        <div className="flex h-40 w-full items-end justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
          {bars.map((b, i) => (
            <motion.div
              key={b.key}
              className="w-5 rounded-t bg-red-500/50"
              initial={{ height: 4 }}
              whileInView={{ height: `${b.h}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 * i, duration: 0.55, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2">
        <span className="w-full text-left font-mono text-[10px] uppercase tracking-widest text-accent">
          xStream
        </span>
        <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.05] p-4">
          <motion.div
            className="h-24 w-24 rounded-full border-2 border-dashed border-accent/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}

function ArchNode({
  label,
  accent: isAccent,
}: {
  label: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-xl border px-3 py-2 font-mono text-[9px] sm:text-[10px] ${
        isAccent
          ? "border-accent/35 bg-accent/10 text-foreground"
          : "border-border bg-muted text-foreground/80"
      }`}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      {label}
    </motion.div>
  );
}

/** Architecture flow diagram */
export function AnimArchitectureFlow() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-0">
      <ArchNode label="xSPY Deposit" accent />

      <motion.div
        className="h-10 w-px bg-gradient-to-b from-accent/40 to-foreground/20"
        initial={{ scaleY: 0, opacity: 0 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        style={{ transformOrigin: "top center" }}
      />

      <ArchNode label="Vault (mint 1:1)" accent />

      <motion.div
        className="h-8 w-px bg-foreground/20"
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.3 }}
        style={{ transformOrigin: "top center" }}
      />

      <div className="flex w-full items-start justify-between gap-2 px-1 sm:gap-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <ArchNode label="xdSPY Market" accent />
          <motion.div
            className="h-8 w-px bg-accent/45"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.3 }}
            style={{ transformOrigin: "top center" }}
          />
          <ArchNode label="24/7 AMM" />
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <ArchNode label="xpSPY Market" />
          <motion.div
            className="h-8 w-px bg-foreground/15"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{ transformOrigin: "top center" }}
          />
          <ArchNode label="Session Keeper" />
        </div>
      </div>

      <motion.div
        className="pointer-events-none mt-2 flex items-center gap-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="font-mono text-[10px] text-muted-foreground">
          recombine: xdSPY + xpSPY = xSPY
        </span>
      </motion.div>
    </div>
  );
}

/** Viability: market size counter */
export function AnimMarketSize() {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 60, damping: 20 });
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(spring, "change", (v) => {
    setDisplay(Math.round(v));
  });

  useEffect(() => {
    raw.set(0);
    const id = requestAnimationFrame(() => raw.set(600));
    return () => cancelAnimationFrame(id);
  }, [raw]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <span className="font-[family-name:var(--font-safira)] text-6xl tabular-nums text-accent md:text-8xl">
          ${display}B+
        </span>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          daily notional in SPY options + E-mini futures
        </p>
      </div>
    </div>
  );
}

/** Roadmap / criteria phases */
export function AnimPhaseDots({ active = 3 }: { active?: number }) {
  const phases = ["1", "2", "3", "4", "5", "6"];
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {phases.map((p, i) => (
        <motion.div
          key={p}
          className={`h-2 rounded-full ${
            i === active ? "w-8 bg-accent" : "w-2 bg-foreground/20"
          }`}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 * i }}
        />
      ))}
    </div>
  );
}

/** What's Unique: 3 moat cards */
export function AnimMoatGrid() {
  const items = [
    {
      tag: "01",
      label: "Yield stripping on real equity dividends",
      detail:
        "Pendle does DeFi protocol yield -- variable, opaque, crypto-correlated. xStream does corporate dividends -- predictable, quarterly, backed by real earnings.",
    },
    {
      tag: "02",
      label: "xpSPY as an active trading instrument",
      detail:
        "In Pendle, the principal token is a boring zero-coupon bond. xpSPY is pure equity price exposure designed for leveraged intraday trading.",
    },
    {
      tag: "03",
      label: "Market-hours forced settlement",
      detail:
        "xStocks prices freeze at market close. This makes xpSPY settlement provably fair -- no after-hours manipulation, no overnight liquidation risk.",
    },
  ];

  return (
    <motion.div
      className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {items.map((item) => (
        <motion.div
          key={item.tag}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0 },
          }}
          className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5"
        >
          <p className="font-mono text-[10px] text-accent">{item.tag}</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Impact: ecosystem flywheel */
export function AnimFlywheel() {
  const steps = [
    "xStock deposits",
    "xdSPY + xpSPY minted",
    "Trading volume",
    "Fee revenue",
    "Higher xdSPY yield",
  ];

  return (
    <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
      <motion.div
        className="absolute h-48 w-48 rounded-full border border-dashed border-accent/30 sm:h-56 sm:w-56"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      {steps.map((step, i) => {
        const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
        const r = 105;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        return (
          <motion.div
            key={step}
            className="absolute w-24 rounded-lg border border-accent/25 bg-accent/[0.06] px-2 py-1.5 text-center font-mono text-[9px] text-foreground sm:text-[10px]"
            style={{
              left: `calc(50% + ${x}px - 3rem)`,
              top: `calc(50% + ${y}px - 0.875rem)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 * i }}
          >
            {step}
          </motion.div>
        );
      })}
      <span className="relative z-10 font-mono text-[10px] text-muted-foreground">
        flywheel
      </span>
    </div>
  );
}

/** Solution: 3-step flow */
export function AnimSolutionSteps() {
  const steps = [
    { n: "1", label: "Deposit xSPY", sub: "into the vault" },
    { n: "2", label: "Mint xdSPY + xpSPY", sub: "income + price tokens" },
    { n: "3", label: "Trade each leg", sub: "on dedicated markets" },
  ];

  return (
    <motion.div
      className="flex w-full max-w-2xl items-center justify-center gap-2 sm:gap-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      {steps.map((s) => (
        <motion.div
          key={s.n}
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0 },
          }}
          className="flex flex-1 flex-col items-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/10 font-mono text-sm text-accent sm:h-16 sm:w-16">
            {s.n}
          </div>
          <p className="mt-3 text-center text-sm font-medium text-foreground">
            {s.label}
          </p>
          <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
            {s.sub}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
