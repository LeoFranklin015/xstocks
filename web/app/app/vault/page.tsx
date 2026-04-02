"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  Gift,
  Lock,
  CalendarClock,
  Info,
} from "lucide-react";
import { useAppMode } from "@/lib/mode-context";

const vaultStats = {
  tvl: "$2,420,000",
  totalXdSpy: "18,450 xdSPY",
  totalXpSpy: "18,450 xpSPY",
  rewardPerShare: "0.0234 USDC",
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function DepositTab() {
  const [amount, setAmount] = useState("");
  const numAmount = parseFloat(amount) || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          xSPY Amount
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pr-16 h-12 text-lg"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            xSPY
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Balance: 1,250.00 xSPY
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium mb-2">
          You will receive:
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Coins className="size-3 text-primary" />
            </div>
            <span className="text-sm">xdSPY (Income)</span>
          </div>
          <span className="text-sm font-medium font-mono">
            {numAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Coins className="size-3 text-primary" />
            </div>
            <span className="text-sm">xpSPY (Price)</span>
          </div>
          <span className="text-sm font-medium font-mono">
            {numAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <Info className="size-3.5 mt-0.5 shrink-0" />
        <p>
          Depositing xSPY splits it 1:1 into xdSPY (income token) and xpSPY
          (price exposure token). You can trade them independently or recombine
          later.
        </p>
      </div>

      <Button
        className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/80 font-medium"
        disabled={numAmount <= 0}
      >
        <ArrowDownToLine className="size-4 mr-2" />
        Deposit xSPY
      </Button>
    </div>
  );
}

function WithdrawTab() {
  const [xdAmount, setXdAmount] = useState("");
  const [xpAmount, setXpAmount] = useState("");

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium mb-2">
          Your Balances
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm">xdSPY</span>
          <span className="text-sm font-medium font-mono">625.00</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">xpSPY</span>
          <span className="text-sm font-medium font-mono">625.00</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          xdSPY Amount
        </label>
        <Input
          type="number"
          placeholder="0.00"
          value={xdAmount}
          onChange={(e) => {
            setXdAmount(e.target.value);
            setXpAmount(e.target.value);
          }}
          className="h-10"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
          xpSPY Amount
        </label>
        <Input
          type="number"
          placeholder="0.00"
          value={xpAmount}
          onChange={(e) => {
            setXpAmount(e.target.value);
            setXdAmount(e.target.value);
          }}
          className="h-10"
        />
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
        <Info className="size-3.5 mt-0.5 shrink-0" />
        <p>
          You must provide equal amounts of xdSPY and xpSPY to recombine back
          into xSPY.
        </p>
      </div>

      <Button
        className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/80 font-medium"
        disabled={!xdAmount || parseFloat(xdAmount) <= 0}
      >
        <ArrowUpFromLine className="size-4 mr-2" />
        Recombine to xSPY
      </Button>
    </div>
  );
}

const howItWorksSteps = [
  {
    step: "1",
    title: "Deposit xSPY",
    desc: "Send your tokenized ETF into the vault. xSPY represents a real stock/ETF on-chain.",
  },
  {
    step: "2",
    title: "Receive dx + px",
    desc: "The vault mints equal amounts of xdSPY (income) and xpSPY (price exposure) 1:1.",
  },
  {
    step: "3",
    title: "Earn & Trade",
    desc: "xdSPY accrues dividends and borrow fees. xpSPY gives leveraged price exposure during NYSE hours.",
  },
  {
    step: "4",
    title: "Recombine Anytime",
    desc: "Return equal amounts of xdSPY + xpSPY to withdraw your original xSPY back.",
  },
];

function HowItWorks() {
  return (
    <motion.div {...fadeUp} transition={{ delay: 0.02 }}>
      <Card>
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-sm font-medium">How the Vault Works</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howItWorksSteps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col gap-2">
                {/* connector line */}
                {i < howItWorksSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-4 left-[calc(100%_-_8px)] w-4 h-px bg-border/60 z-0" />
                )}
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 z-10">
                    <span className="text-[11px] font-semibold text-primary">{s.step}</span>
                  </div>
                  <p className="text-sm font-medium">{s.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-9">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ExpertVault() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <motion.div {...fadeUp}>
        <h1 className="font-[family-name:var(--font-safira)] text-2xl md:text-3xl tracking-tight">
          Vault
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Deposit xSPY to mint income and price exposure tokens.
        </p>
      </motion.div>

      <HowItWorks />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main deposit/withdraw */}
        <motion.div
          className="lg:col-span-2"
          {...fadeUp}
          transition={{ delay: 0.05 }}
        >
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="deposit">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="deposit" className="flex-1">
                    <ArrowDownToLine className="size-3.5 mr-1.5" />
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="flex-1">
                    <ArrowUpFromLine className="size-3.5 mr-1.5" />
                    Withdraw
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="deposit">
                  <DepositTab />
                </TabsContent>
                <TabsContent value="withdraw">
                  <WithdrawTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lock className="size-4 text-muted-foreground" />
                  Vault Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">TVL</span>
                  <span className="text-sm font-medium font-mono">
                    {vaultStats.tvl}
                  </span>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Total xdSPY Minted
                  </span>
                  <span className="text-sm font-medium font-mono">
                    {vaultStats.totalXdSpy}
                  </span>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Total xpSPY Minted
                  </span>
                  <span className="text-sm font-medium font-mono">
                    {vaultStats.totalXpSpy}
                  </span>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Reward / Share
                  </span>
                  <span className="text-sm font-medium font-mono">
                    {vaultStats.rewardPerShare}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
            <Card className="border-primary/20">
              <CardHeader className="px-4 pt-4 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gift className="size-4 text-primary" />
                  Dividends
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarClock className="size-3" />
                    Next Dividend
                  </span>
                  <span className="text-sm font-medium">Apr 15, 2026</span>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Estimated Amount
                  </span>
                  <span className="text-sm font-medium font-mono text-primary">
                    $14.63
                  </span>
                </div>
                <Separator className="opacity-30" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Pending (Claimable)
                  </span>
                  <span className="text-sm font-medium font-mono text-primary">
                    $8.22
                  </span>
                </div>
                <Button
                  className="w-full mt-1 bg-primary text-primary-foreground hover:bg-primary/80 font-medium"
                  size="sm"
                >
                  <Gift className="size-3.5 mr-1.5" />
                  Claim $8.22
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function GrandmaVault() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const depositNum = parseFloat(depositAmount) || 0;
  const withdrawNum = parseFloat(withdrawAmount) || 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      <motion.div {...fadeUp}>
        <h1 className="font-[family-name:var(--font-safira)] text-2xl md:text-3xl tracking-tight">
          Your Savings Vault
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Put your money to work and earn regular income.
        </p>
      </motion.div>

      {/* Explanation */}
      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "1", title: "Put money in", desc: "Deposit your xSPY tokens" },
            { icon: "2", title: "Vault splits it", desc: "You get Income + Price tokens" },
            { icon: "3", title: "Earn payments", desc: "Income token pays out regularly" },
            { icon: "4", title: "Take money out", desc: "Return both tokens to get xSPY back" },
          ].map((s) => (
            <Card key={s.icon} className="bg-background">
              <CardContent className="p-4">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <span className="text-xs font-bold text-primary">{s.icon}</span>
                </div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Put Money In */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ArrowDownToLine className="size-5 text-primary" />
              Put Money In
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                How much do you want to deposit?
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: 1,250.00 xSPY
              </p>
            </div>
            <Button
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/80 font-medium text-sm"
              disabled={depositNum <= 0}
            >
              Deposit
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Take Money Out */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ArrowUpFromLine className="size-5 text-muted-foreground" />
              Take Money Out
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                How much do you want to withdraw?
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                In vault: 625.00
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full h-11 font-medium text-sm"
              disabled={withdrawNum <= 0}
            >
              Withdraw
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earnings */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
        <Card className="border-primary/20">
          <CardContent className="p-5 text-center space-y-3">
            <Gift className="size-8 text-primary mx-auto" />
            <div>
              <p className="text-sm text-muted-foreground">Your Earnings</p>
              <p className="text-3xl font-semibold text-primary font-mono tracking-tight mt-1">
                $8.22
              </p>
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-medium">
              <Gift className="size-4 mr-2" />
              Collect Earnings
            </Button>
            <p className="text-xs text-muted-foreground">
              Next payment expected: Apr 15, 2026
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VaultPage() {
  const { mode } = useAppMode();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {mode === "expert" ? <ExpertVault /> : <GrandmaVault />}
      </motion.div>
    </AnimatePresence>
  );
}
