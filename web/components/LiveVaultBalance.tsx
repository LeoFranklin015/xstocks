"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/** Demo principal for vault / simple-mode balance accrual UI. */
export const DEMO_VAULT_PRINCIPAL = 9990;
export const DEMO_VAULT_APY_ANNUAL = 0.0482; // 4.82%

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

function useAccruingElapsedMs(): number {
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      setElapsedMs(performance.now() - start);
    }, 32);
    return () => clearInterval(id);
  }, []);
  return elapsedMs;
}

function formatUsdLive(balance: number): { intFormatted: string; frac: string } {
  const [intRaw, frac = "000000"] = balance.toFixed(6).split(".");
  const intNum = parseInt(intRaw, 10);
  return {
    intFormatted: intNum.toLocaleString("en-US"),
    frac: frac.padEnd(6, "0").slice(0, 6),
  };
}

export function LiveVaultBalance({
  principal,
  apyAnnual,
  size = "md",
  className,
}: {
  principal: number;
  apyAnnual: number;
  size?: "md" | "lg";
  className?: string;
}) {
  const elapsedMs = useAccruingElapsedMs();
  const balance =
    principal * Math.exp(apyAnnual * (elapsedMs / MS_PER_YEAR));
  const { intFormatted, frac } = formatUsdLive(balance);

  const intCls =
    size === "lg"
      ? "text-4xl font-semibold text-foreground"
      : "text-3xl font-bold text-foreground";

  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-0 tabular-nums",
        className
      )}
      title={`Balance accrues at ${(apyAnnual * 100).toFixed(2)}% APY (continuous compounding).`}
    >
      <span className={intCls}>${intFormatted}</span>
      <span
        className={cn(
          intCls,
          "font-mono tracking-tight text-primary/90"
        )}
      >
        .{frac}
      </span>
    </span>
  );
}
