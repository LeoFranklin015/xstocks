import { ethers } from "ethers";
import { readFileSync, existsSync } from "fs";
import { RPC_URL, CONTRACTS } from "./config.js";

export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

export function getDeployer() {
  const raw = process.env.PRIVATE_KEY || readEnvKey();
  return new ethers.Wallet(raw, getProvider());
}

function readEnvKey() {
  const envPath = new URL("../contracts/.env", import.meta.url).pathname;
  const content = readFileSync(envPath, "utf8");
  const match = content.match(/PRIVATE_KEY=(0x[0-9a-fA-F]+)/);
  if (!match) throw new Error("PRIVATE_KEY not found in .env");
  return match[1];
}

export function loadWallets() {
  const path = new URL("./wallets.json", import.meta.url).pathname;
  if (!existsSync(path)) throw new Error("wallets.json not found. Run: node setup-wallets.js");
  return JSON.parse(readFileSync(path, "utf8"));
}

export function getWallet(name) {
  const wallets = loadWallets();
  const w = wallets[name];
  if (!w) throw new Error(`Wallet "${name}" not found in wallets.json`);
  return new ethers.Wallet(w.privateKey, getProvider());
}

// Minimal ABIs for the contracts we interact with
export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function multiplier() view returns (uint256)",
];

export const VAULT_ABI = [
  "function registerAsset(address,bytes32,string) returns (address,address)",
  "function deposit(address,uint256)",
  "function withdraw(address,uint256)",
  "function claimDividend(address) returns (uint256)",
  "function syncDividend(address) returns (uint256)",
  "function pendingDividend(address,address) view returns (uint256)",
  "function getAssetConfig(address) view returns (tuple(address principalToken, address dividendToken, bytes32 pythFeedId, uint256 lastMultiplier, uint256 accDivPerShare, uint256 totalDeposited, uint256 minDepositAmount))",
  "function getRewardDebt(address,address) view returns (uint256)",
  "function pause()",
  "function unpause()",
];

export const EXCHANGE_ABI = [
  "function registerPool(address,address,bytes32)",
  "function depositLiquidity(address,uint256) returns (uint256)",
  "function withdrawLiquidity(address,uint256) returns (uint256)",
  "function depositPxReserve(address,uint256) returns (uint256)",
  "function openLong(address,uint256,uint256,bytes[]) payable returns (bytes32)",
  "function closeLong(bytes32,bytes[]) payable returns (int256)",
  "function openShort(address,uint256,uint256,bytes[]) payable returns (bytes32)",
  "function closeShort(bytes32,bytes[]) payable returns (int256)",
  "function liquidate(bytes32,bytes[]) payable returns (uint256)",
  "function settleAllPositions(address,bytes[]) payable returns (uint256,int256)",
  "function getPosition(bytes32) view returns (tuple(address trader, address pxToken, bool isLong, uint256 size, uint256 entryPrice, uint256 collateral, uint256 leverage, uint256 openedAt))",
  "function getPoolConfig(address) view returns (tuple(address xStock, bytes32 pythFeedId, uint256 usdcLiquidity, uint256 pxReserve, uint256 totalFees, uint256 openInterestLong, uint256 openInterestShort, address lpToken, uint256 maxLeverage))",
  "function getOpenPositionCount(address) view returns (uint256)",
  "function setKeeper(address)",
  "function setMarketOpen(bool)",
  "function marketOpen() view returns (bool)",
  "function keeper() view returns (address)",
];

export const KEEPER_ABI = [
  "function openMarket()",
  "function closeMarket(address[],bytes[]) payable",
  "function emergencyCloseMarket()",
  "function addKeeper(address)",
  "function removeKeeper(address)",
  "function isMarketOpen() view returns (bool)",
  "function getKeeperStatus(address) view returns (bool)",
];

export const PYTH_ADAPTER_ABI = [
  "function getPrice(bytes32,bytes[]) payable returns (uint256,uint256)",
  "function getUpdateFee(bytes[]) view returns (uint256)",
  "function maxStaleness() view returns (uint256)",
];

// Fetch latest Pyth price update data from Hermes for one or more feed IDs.
// Returns an array of hex-encoded VAA bytes to pass as updateData to the exchange.
export async function fetchHermesUpdate(feedIds) {
  const ids = Array.isArray(feedIds) ? feedIds : [feedIds];
  const params = ids.map(id => `ids[]=${id}`).join("&");
  const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hermes fetch failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  // binary.data entries are hex strings without 0x prefix
  return json.binary.data.map(d => "0x" + d);
}

// Get pyth update fee
export async function getUpdateFee(pythAdapter, updateData) {
  return await pythAdapter.getUpdateFee(updateData);
}

export function fmt(val, decimals = 18) {
  return ethers.formatUnits(val, decimals);
}

export function fmtUsdc(val) {
  return ethers.formatUnits(val, 6);
}

export function parse(val, decimals = 18) {
  return ethers.parseUnits(val.toString(), decimals);
}

export function parseUsdc(val) {
  return ethers.parseUnits(val.toString(), 6);
}

// PositionOpened(bytes32 indexed positionId, address indexed trader, ...)
const POSITION_OPENED_TOPIC = ethers.id(
  "PositionOpened(bytes32,address,address,bool,uint256,uint256,uint256,uint256)"
);

export function extractPositionId(receipt) {
  for (const l of receipt.logs) {
    if (l.topics && l.topics[0] === POSITION_OPENED_TOPIC) {
      return l.topics[1]; // indexed positionId
    }
  }
  throw new Error("PositionOpened event not found in receipt");
}

export function log(msg) {
  console.log(`  ${msg}`);
}

export function header(title) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(50)}`);
}
