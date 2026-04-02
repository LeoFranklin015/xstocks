"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import {
  AnimSplitTokens,
  AnimProblemBars,
  AnimArchitectureFlow,
  AnimMoatGrid,
  AnimFlywheel,
  AnimSolutionSteps,
  AnimPhaseDots,
  AnimMarketSize,
} from "./pitch-visuals";
import { APP_NAME, APP_NAME_FULL } from "@/lib/constants";
import { LogoWordmark } from "@/components/LogoWordmark";

type SlideDef = {
  id: string;
  section: string;
  title: string;
  visual?: ReactNode;
  body: ReactNode;
  centerTitle?: boolean;
  contentAlign?: "center" | "start";
  splitBodyVisual?: boolean;
};

const slides: SlideDef[] = [
  /* -- 1. Title -- */
  {
    id: "title",
    section: "xStream",
    title: "Yield Stripping for Tokenized Equities",
    centerTitle: true,
    visual: <AnimSplitTokens />,
    body: (
      <>
        <p className="mt-6 max-w-xl text-center text-base text-muted-foreground">
          Splitting xStocks into income and price exposure -- two tokens, two
          markets, one vault.
        </p>
        <motion.div
          className="mt-14 flex justify-center"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <ChevronDown className="size-6 text-muted-foreground/60" />
        </motion.div>
      </>
    ),
  },

  /* -- 2. Problem -- */
  {
    id: "problem",
    section: "01 -- The Problem",
    title: "Tokenized equities bundle two types of value into one token",
    contentAlign: "start",
    visual: <AnimProblemBars />,
    body: (
      <ul className="mt-8 max-w-xl space-y-3 text-left text-sm text-muted-foreground">
        <li className="flex gap-2">
          <span className="text-red-400/90">-</span>
          <span>
            A day trader holding xSPY for 6 hours is{" "}
            <strong className="text-foreground">paying for a dividend</strong>{" "}
            they will never collect.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-red-400/90">-</span>
          <span>
            An income investor holding xSPY is absorbing{" "}
            <strong className="text-foreground">price volatility</strong> they
            do not want.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-red-400/90">-</span>
          <span>
            DeFi has{" "}
            <strong className="text-foreground">no fixed-income primitive</strong>{" "}
            for equity yield -- the largest yield market in the world ($3T+
            securities lending, $500B+ dividend market) has no onchain
            equivalent.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-red-400/90">-</span>
          <span>
            Existing lending protocols ignore dividend mechanics entirely --
            rebases during borrows are{" "}
            <strong className="text-foreground">unhandled and exploitable</strong>.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-accent">+</span>
          <span>
            xStocks are underleveraged as a DeFi primitive. Their two core value
            components -- yield and price -- have never been separated.
          </span>
        </li>
      </ul>
    ),
  },

  /* -- 3. Solution in One Sentence -- */
  {
    id: "solution",
    section: "02 -- The Solution",
    title: "Split. Trade. Arbitrage.",
    centerTitle: true,
    visual: <AnimSolutionSteps />,
    body: (
      <>
        <p className="mt-8 max-w-2xl text-center text-base text-muted-foreground">
          xStream splits xStocks into a{" "}
          <span className="font-mono text-accent">xdSPY</span> (dividend token)
          and a <span className="font-mono text-foreground">xpSPY</span> (price
          token), then builds a 24/7 income market and an intraday leveraged
          trading market around each -- connected by an arbitrage mechanism that
          keeps both tokens honestly priced.
        </p>
        <div className="mt-8 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { k: "xSPY", sub: "Tokenized equity" },
            { k: "xdSPY", sub: "Dividend / income leg" },
            { k: "xpSPY", sub: "Price / leverage leg" },
            { k: "Recombine", sub: "Burn both, get xSPY" },
          ].map((c) => (
            <motion.div
              key={c.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-accent/25 bg-accent/5 p-4 text-center"
            >
              <p className="font-mono text-lg text-accent">{c.k}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
            </motion.div>
          ))}
        </div>
      </>
    ),
  },

  /* -- 4. What's Unique -- */
  {
    id: "unique",
    section: "03 -- What Makes This Different",
    title: "Three things that don't exist anywhere in DeFi today",
    contentAlign: "start",
    visual: <AnimMoatGrid />,
    body: (
      <p className="mt-6 max-w-2xl text-left text-sm text-muted-foreground">
        In Pendle, only the yield token is exciting. In xStream, both tokens
        serve massive existing markets -- income investors and leveraged day
        traders.
      </p>
    ),
  },

  /* -- 5. Implementation / Approach -- */
  {
    id: "architecture",
    section: "04 -- How It Works",
    title: "Three contracts, two markets, one arbitrage anchor",
    contentAlign: "start",
    splitBodyVisual: true,
    visual: (
      <div className="flex w-full max-w-md flex-col items-center gap-6 lg:max-w-none lg:items-end">
        <AnimArchitectureFlow />
        <div className="flex w-full flex-wrap justify-center gap-2 lg:max-w-md lg:justify-end">
          {[
            "XStreamVault",
            "xdSPY / xpSPY",
            "Income AMM",
            "Trading Engine",
            "Keeper Bot",
            "Chainlink Feeds",
          ].map((name) => (
            <span
              key={name}
              className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-[10px] text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    ),
    body: (
      <ul className="max-w-xl space-y-3 text-left text-sm text-muted-foreground">
        <li>
          <strong className="text-foreground">Vault:</strong> Deposit xSPY, mint
          xdSPY + xpSPY at 1:1. When xSPY balance increases on dividend, 100%
          is attributed to xdSPY holders atomically.
        </li>
        <li>
          <strong className="text-foreground">Income Market (24/7):</strong>{" "}
          AMM pool xdSPY/USDC. Price accrues toward dividend date, spikes at
          rebase, resets. No oracle needed.
        </li>
        <li>
          <strong className="text-foreground">Day Trading (Market Hours):</strong>{" "}
          Session 9:30-4:00 EST. Post USDC collateral, 3-5x SPY leverage.
          At 4PM: P&L settled, xpSPY returns, fees go to xdSPY holders.
        </li>
        <li>
          <strong className="text-foreground">Arbitrage Anchor:</strong>{" "}
          xdSPY + xpSPY always redeemable for xSPY. Hard price ceiling and
          floor enforced by self-interest -- no oracle needed.
        </li>
      </ul>
    ),
  },

  /* -- 6. Viability and Uptake -- */
  {
    id: "viability",
    section: "05 -- Viability and Uptake",
    title: "The demand already exists",
    centerTitle: true,
    visual: <AnimMarketSize />,
    body: (
      <div className="mt-6 w-full max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5"
          >
            <p className="font-mono text-xs text-accent">
              For income investors
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              SPY base dividend: ~1.3% annually. xpSPY session fees at 30%
              utilization: ~10-15% annually.
            </p>
            <p className="mt-2 font-mono text-2xl text-accent">12-16% APY</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Real yield backed by S&P 500 corporate earnings -- not token
              emissions.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="font-mono text-xs text-foreground">
              For day traders
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              SPY options: $400B+ daily notional. E-mini futures: $200B+ daily.
              These users already trade intraday SPY exposure.
            </p>
            <p className="mt-2 font-mono text-2xl text-foreground">$600B+</p>
            <p className="mt-1 text-xs text-muted-foreground">
              daily notional in existing SPY trading markets.
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-2xl border border-border bg-card p-4"
        >
          <p className="font-mono text-xs text-muted-foreground">
            Cold start solved
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Two-sided market with aligned incentives from day one. Recombination
            arbitrage ensures price efficiency without seeded liquidity.
          </p>
        </motion.div>
      </div>
    ),
  },

  /* -- 7. Impact for xStocks -- */
  {
    id: "impact",
    section: "06 -- Impact for xStocks",
    title: "The most composable RWA primitive in DeFi",
    contentAlign: "start",
    visual: <AnimFlywheel />,
    body: (
      <div className="mt-6 w-full max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              tag: "Rebase is load-bearing",
              detail:
                "Without onchain dividend rebasing, yield stripping cannot work. xStocks are the only asset that makes this possible.",
            },
            {
              tag: "Market hours are load-bearing",
              detail:
                "Without price freeze at market close, forced intraday settlement is unfair and manipulatable.",
            },
            {
              tag: "First fixed-income primitive",
              detail:
                "Unlocks institutional and treasury demand that currently has nowhere to go in the xStocks ecosystem.",
            },
            {
              tag: "Every xStock compatible",
              detail:
                "Any new xStock asset (xAAPL, xTSLA, xQQQ) is immediately compatible with the vault architecture.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.tag}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 * i }}
              className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-5"
            >
              <p className="font-mono text-xs text-accent">{item.tag}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          xStream proves that xStocks infrastructure unlocks{" "}
          <strong className="text-foreground">
            entirely new financial markets
          </strong>
          , not just a blockchain wrapper on existing ones.
        </p>
      </div>
    ),
  },

  /* -- 8. Judging Criteria -- */
  {
    id: "criteria",
    section: "07 -- Judging Criteria Alignment",
    title: "How xStream maps to what matters",
    visual: <AnimPhaseDots active={5} />,
    body: (
      <div className="mt-8 w-full max-w-3xl text-left">
        <div className="space-y-2">
          {[
            {
              criterion: "xStocks Relevance",
              weight: "30%",
              detail:
                "Rebase + market hours are structurally required -- not bolt-on",
            },
            {
              criterion: "Technical Execution",
              weight: "30%",
              detail:
                "Vault, two AMMs, keeper, rebase interception, live demo",
            },
            {
              criterion: "Innovation",
              weight: "15%",
              detail:
                "First yield stripping on real equity dividends in DeFi",
            },
            {
              criterion: "UX & Design",
              weight: "10%",
              detail:
                "Two clean user journeys -- staker and trader, no overlap",
            },
            {
              criterion: "Market Potential",
              weight: "10%",
              detail:
                "Addresses $400B+ daily SPY trading + dividend income market",
            },
            {
              criterion: "Presentation",
              weight: "5%",
              detail:
                "Clear trade-offs: keeper centralization, thin dividend on growth stocks",
            },
          ].map((row, i) => (
            <motion.div
              key={row.criterion}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 * i }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3"
            >
              <span className="w-16 shrink-0 font-mono text-sm font-bold text-accent">
                {row.weight}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {row.criterion}
                </p>
                <p className="text-xs text-muted-foreground">{row.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function PitchDeck() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [current, setCurrent] = useState(0);

  const scrollToSlide = useCallback((index: number) => {
    const el = slideRefs.current[index];
    if (!el || !containerRef.current) return;
    isScrolling.current = true;
    setCurrent(index);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      isScrolling.current = false;
    }, 600);
  }, []);

  const goNext = useCallback(() => {
    if (current < slides.length - 1) scrollToSlide(current + 1);
  }, [current, scrollToSlide]);

  const goPrev = useCallback(() => {
    if (current > 0) scrollToSlide(current - 1);
  }, [current, scrollToSlide]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (isScrolling.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target) return;
        const idx = slideRefs.current.findIndex((r) => r === visible.target);
        if (idx >= 0) setCurrent(idx);
      },
      { root, threshold: [0.35, 0.55, 0.75] }
    );

    slideRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(77,122,0,0.10),transparent_55%)]" />

      {/* Top bar */}
      <div className="pointer-events-auto absolute left-0 right-0 top-0 z-[110] flex items-center justify-between px-4 py-4 sm:px-6">
        <LogoWordmark
          href="/"
          iconSize={28}
          imageClassName="opacity-90"
          textClassName="text-base"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          suffix={
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
              pitch
            </span>
          }
        />
        <span className="hidden font-mono text-[10px] text-muted-foreground/80 sm:block">
          arrows / space to navigate
        </span>
      </div>

      {/* Dots */}
      <div className="pointer-events-auto absolute right-4 top-1/2 z-[110] flex -translate-y-1/2 flex-col gap-2 sm:right-6">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSlide(i)}
            className="group flex h-8 w-5 items-center justify-end py-1"
            aria-label={`Go to slide ${i + 1}`}
          >
            <motion.span
              layout
              className={`block rounded-full bg-accent transition-all ${
                i === current ? "h-3 w-3 opacity-100" : "h-2 w-2 opacity-35"
              }`}
              animate={{
                width: i === current ? 12 : 8,
                opacity: i === current ? 1 : 0.35,
              }}
            />
          </button>
        ))}
      </div>

      {/* Counter */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-[110] font-mono text-xs text-muted-foreground sm:bottom-6 sm:right-6">
        {String(current + 1).padStart(2, "0")} /{" "}
        {String(slides.length).padStart(2, "0")}
      </div>

      {/* Arrows */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[110] flex -translate-x-1/2 gap-3 sm:bottom-8">
        <button
          type="button"
          onClick={goPrev}
          disabled={current === 0}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:pointer-events-none disabled:opacity-25"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={current === slides.length - 1}
          className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent disabled:pointer-events-none disabled:opacity-25"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Scroll area */}
      <div
        ref={containerRef}
        className="no-scrollbar h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth"
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className={`flex min-h-screen w-full snap-start snap-always flex-col justify-center px-6 py-24 sm:px-20 ${
              slide.contentAlign === "start" ? "items-start" : "items-center"
            }`}
          >
            <div className="w-full max-w-[1200px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{
                  root: containerRef,
                  once: true,
                  amount: 0.4,
                }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={
                  slide.centerTitle
                    ? "flex flex-col items-center text-center"
                    : slide.contentAlign === "start"
                      ? "flex w-full flex-col items-start text-left"
                      : ""
                }
              >
                <p className="font-mono text-sm tracking-widest text-accent">
                  {slide.section}
                </p>
                <h2
                  className={`font-[family-name:var(--font-safira)] text-4xl text-foreground md:text-5xl lg:text-6xl ${
                    slide.centerTitle ? "mt-4 max-w-3xl" : "mt-4 max-w-4xl text-left"
                  }`}
                >
                  {slide.title}
                </h2>
                {slide.splitBodyVisual && slide.visual ? (
                  <div className="mt-10 grid w-full gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
                    <div className="min-w-0">{slide.body}</div>
                    <div className="flex min-w-0 justify-center lg:justify-end">
                      {slide.visual}
                    </div>
                  </div>
                ) : (
                  <>
                    {slide.visual ? (
                      <div
                        className={
                          slide.centerTitle ? "mt-10 w-full" : "mt-10 w-full text-left"
                        }
                      >
                        {slide.visual}
                      </div>
                    ) : null}
                    <div
                      className={
                        slide.centerTitle
                          ? "mt-6 flex w-full flex-col items-center"
                          : "mt-6 w-full"
                      }
                    >
                      {slide.body}
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
