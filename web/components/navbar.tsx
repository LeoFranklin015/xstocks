"use client";

import { useAccount } from "@/app/providers";

interface NavbarProps {
  onConnect: () => void;
}

export function Navbar({ onConnect }: NavbarProps) {
  const { account } = useAccount();

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            X
          </div>
          <span className="text-lg font-semibold text-white">xStocks</span>
        </div>
        <button
          onClick={onConnect}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
            account
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-white text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          {account
            ? `${account.address.slice(0, 6)}...${account.address.slice(-4)}`
            : "Connect"}
        </button>
      </div>
    </nav>
  );
}
