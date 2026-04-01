"use client";

import { useState, useEffect } from "react";
import { xStockAssets } from "./market-data";

const BENCHMARKS_URL = "https://benchmarks.pyth.network";

// Fetch 1D resolution for the last 30 days -- gives ~30 data points with real price movement
export function usePythSparklines() {
  const [sparklines, setSparklines] = useState<Record<string, { v: number }[]>>({});

  useEffect(() => {
    async function fetchAll() {
      const now = Math.floor(Date.now() / 1000);
      const from = now - 30 * 86400; // 30 days back

      const results: Record<string, { v: number }[]> = {};

      await Promise.all(
        xStockAssets
          .filter((a) => a.pythFeedId)
          .map(async (asset) => {
            try {
              const url = `${BENCHMARKS_URL}/v1/shims/tradingview/history?symbol=${encodeURIComponent(`Equity.US.${asset.symbol}/USD`)}&resolution=1D&from=${from}&to=${now}`;
              const res = await fetch(url);
              const data = await res.json();

              if (data.s === "ok" && data.c && data.c.length > 1) {
                results[asset.ticker] = data.c.map((c: number) => ({ v: c }));
              }
            } catch {
              // skip failed fetches
            }
          })
      );

      setSparklines(results);
    }

    fetchAll();
  }, []);

  return sparklines;
}
