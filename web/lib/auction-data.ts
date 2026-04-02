import { xStockAssets } from "@/lib/market-data";

export interface AuctionBid {
  id: string;
  bidder: string; // wallet address
  amount: number; // USDC
  timestamp: number; // unix ms
}

export interface AuctionListing {
  id: string;
  seller: string; // wallet address
  token: string; // e.g. "xdNVDA"
  symbol: string; // underlying e.g. "NVDA"
  tokenAmount: number; // how many xd tokens
  quarters: number; // number of dividend quarters
  startingPrice: number; // minimum bid in USDC
  highestBid: number;
  bids: AuctionBid[];
  createdAt: number; // unix ms
  endsAt: number; // unix ms
  logo: string;
  color: string;
}

// Derive xd token list from existing xStock assets
export const xdTokens = xStockAssets.map((a) => ({
  ticker: `xd${a.symbol}`,
  name: `${a.name.replace(" xStock", "")} Income`,
  symbol: a.symbol,
  logo: a.logo,
  color: a.color,
}));

function addr(): string {
  const hex = "0123456789abcdef";
  let s = "0x";
  for (let i = 0; i < 40; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

const NOW = Date.now();
const HOUR = 3600_000;
const DAY = 86400_000;

const sellers = [addr(), addr(), addr(), addr(), addr(), addr()];
const bidders = [addr(), addr(), addr(), addr(), addr(), addr(), addr(), addr()];

function makeBids(count: number, floor: number): AuctionBid[] {
  const bids: AuctionBid[] = [];
  for (let i = 0; i < count; i++) {
    bids.push({
      id: `bid-${Math.random().toString(36).slice(2, 8)}`,
      bidder: bidders[Math.floor(Math.random() * bidders.length)],
      amount: Math.round((floor + Math.random() * floor * 0.6) * 100) / 100,
      timestamp: NOW - Math.floor(Math.random() * 12 * HOUR),
    });
  }
  // Sort highest first
  bids.sort((a, b) => b.amount - a.amount);
  return bids;
}

function listing(
  id: string,
  tokenIdx: number,
  amount: number,
  quarters: number,
  startingPrice: number,
  bidCount: number,
  daysLeft: number,
  sellerIdx: number
): AuctionListing {
  const tok = xdTokens[tokenIdx];
  const bids = makeBids(bidCount, startingPrice);
  return {
    id,
    seller: sellers[sellerIdx],
    token: tok.ticker,
    symbol: tok.symbol,
    tokenAmount: amount,
    quarters,
    startingPrice,
    highestBid: bids.length > 0 ? bids[0].amount : 0,
    bids,
    createdAt: NOW - (7 - daysLeft) * DAY,
    endsAt: NOW + daysLeft * DAY,
    logo: tok.logo,
    color: tok.color,
  };
}

export const mockAuctions: AuctionListing[] = [
  listing("auc-1", 0, 500, 4, 1200, 5, 3, 0),   // xdNVDA
  listing("auc-2", 1, 200, 2, 450, 3, 5, 1),     // xdGOOGL
  listing("auc-3", 2, 1000, 3, 800, 4, 2, 2),    // xdAAPL
  listing("auc-4", 3, 300, 1, 350, 2, 7, 3),     // xdSPY
  listing("auc-5", 0, 150, 2, 600, 4, 4, 4),     // xdNVDA
  listing("auc-6", 4, 800, 4, 200, 3, 6, 5),     // xdTBLL
  listing("auc-7", 2, 250, 1, 300, 5, 1, 0),     // xdAAPL
  listing("auc-8", 1, 400, 3, 900, 4, 3, 1),     // xdGOOGL
];
