"use client";

import { useState } from "react";
import { ChevronDown, Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type Network = {
  id: string;
  name: string;
  shortName: string;
  chainId: number;
  color: string;
  isTestnet: boolean;
};

const networks: Network[] = [
  {
    id: "eth-mainnet",
    name: "Ethereum Mainnet",
    shortName: "Ethereum",
    chainId: 1,
    color: "#627EEA",
    isTestnet: false,
  },
  {
    id: "base",
    name: "Base",
    shortName: "Base",
    chainId: 8453,
    color: "#0052FF",
    isTestnet: false,
  },
  {
    id: "arbitrum",
    name: "Arbitrum One",
    shortName: "Arbitrum",
    chainId: 42161,
    color: "#28A0F0",
    isTestnet: false,
  },
  {
    id: "optimism",
    name: "Optimism",
    shortName: "Optimism",
    chainId: 10,
    color: "#FF0420",
    isTestnet: false,
  },
  {
    id: "base-sepolia",
    name: "Base Sepolia",
    shortName: "Base Sepolia",
    chainId: 84532,
    color: "#0052FF",
    isTestnet: true,
  },
  {
    id: "sepolia",
    name: "Sepolia",
    shortName: "Sepolia",
    chainId: 11155111,
    color: "#627EEA",
    isTestnet: true,
  },
];

export function useNetwork() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[1]); // Base default
  return { selectedNetwork, setSelectedNetwork, networks };
}

export default function NetworkSelector({
  selected,
  onSelect,
}: {
  selected: Network;
  onSelect: (n: Network) => void;
}) {
  const mainnets = networks.filter((n) => !n.isTestnet);
  const testnets = networks.filter((n) => n.isTestnet);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] h-8 px-2.5 text-xs"
          />
        }
      >
        <span
          className="size-2 rounded-full shrink-0"
          style={{ backgroundColor: selected.color }}
        />
        <span>{selected.shortName}</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-52">
        <DropdownMenuLabel>
          <div className="flex items-center gap-1.5">
            <Globe className="size-3" />
            Mainnets
          </div>
        </DropdownMenuLabel>
        {mainnets.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => onSelect(network)}
            className="gap-2.5 py-1.5 cursor-pointer"
          >
            <span
              className="size-2 rounded-full shrink-0"
              style={{ backgroundColor: network.color }}
            />
            <span className="flex-1">{network.name}</span>
            {selected.id === network.id && (
              <Check className="size-3.5 text-[#c8ff00]" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Testnets</DropdownMenuLabel>
        {testnets.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => onSelect(network)}
            className="gap-2.5 py-1.5 cursor-pointer"
          >
            <span
              className="size-2 rounded-full shrink-0 opacity-60"
              style={{ backgroundColor: network.color }}
            />
            <span className="flex-1 text-muted-foreground">
              {network.name}
            </span>
            {selected.id === network.id && (
              <Check className="size-3.5 text-[#c8ff00]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
