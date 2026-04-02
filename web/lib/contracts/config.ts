import { inkSepolia } from "viem/chains";
export const DEFAULT_CHAIN = inkSepolia;

const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

export function getRpcUrl(chainId: number): string | undefined {
  if (chainId === 11155111) return SEPOLIA_RPC;
  return undefined; // use viem default
}
