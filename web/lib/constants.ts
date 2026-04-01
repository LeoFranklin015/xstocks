import type { AccountConfig } from "@jaw.id/core";

export const CHAIN_ID = 84532; // Base Sepolia

export const DUMMY_RECIPIENT =
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" as const; // vitalik.eth

export function getAccountConfig(): AccountConfig {
  return {
    chainId: CHAIN_ID,
    apiKey: process.env.NEXT_PUBLIC_JAW_API_KEY!,
  };
}
