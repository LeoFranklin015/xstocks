"use client";

import { useState } from "react";
import { Droplets, Check, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type FaucetStatus = "idle" | "claiming" | "success" | "error";

const faucetLinks: Record<
  string,
  { label: string; url: string; token: string }[]
> = {
  "base-sepolia": [
    {
      label: "Base Sepolia ETH",
      url: "https://www.alchemy.com/faucets/base-sepolia",
      token: "ETH",
    },
    {
      label: "Superchain Faucet",
      url: "https://app.optimism.io/faucet",
      token: "ETH",
    },
  ],
  sepolia: [
    {
      label: "Alchemy Sepolia",
      url: "https://www.alchemy.com/faucets/ethereum-sepolia",
      token: "ETH",
    },
    {
      label: "Google Cloud Faucet",
      url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
      token: "ETH",
    },
  ],
};

export default function TestnetFaucet({
  networkId,
  walletAddress,
}: {
  networkId: string;
  walletAddress?: string;
}) {
  const [status, setStatus] = useState<FaucetStatus>("idle");
  const faucets = faucetLinks[networkId];

  if (!faucets) return null;

  async function handleQuickClaim() {
    if (!walletAddress) return;
    setStatus("claiming");
    // Simulate a short delay for UX feedback, then open faucet
    await new Promise((r) => setTimeout(r, 600));
    // Open the primary faucet in new tab with address pre-filled where possible
    const primary = faucets[0];
    const url = primary.url.includes("?")
      ? `${primary.url}&address=${walletAddress}`
      : `${primary.url}?address=${walletAddress}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={handleQuickClaim}
        disabled={status === "claiming" || !walletAddress}
        className="gap-1.5 border-[#c8ff00]/20 bg-[#c8ff00]/5 text-[#c8ff00] hover:bg-[#c8ff00]/10 hover:text-[#c8ff00] h-8 px-2.5 text-xs"
      >
        {status === "claiming" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : status === "success" ? (
          <Check className="size-3.5" />
        ) : (
          <Droplets className="size-3.5" />
        )}
        <span>
          {status === "claiming"
            ? "Opening..."
            : status === "success"
              ? "Opened"
              : "Faucet"}
        </span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-foreground"
            />
          }
        >
          <ExternalLink className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel>Testnet Faucets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {faucets.map((f) => (
            <DropdownMenuItem
              key={f.label}
              onClick={() =>
                window.open(f.url, "_blank", "noopener,noreferrer")
              }
              className="gap-2 py-1.5 cursor-pointer"
            >
              <Droplets className="size-3.5 text-[#c8ff00]" />
              <div className="flex-1">
                <p className="text-sm">{f.label}</p>
                <p className="text-xs text-muted-foreground">{f.token}</p>
              </div>
              <ExternalLink className="size-3 text-muted-foreground" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
