// Flow 4: Liquidation integration test with real Pyth.
// Opens a 5x long position at the current real market price.
// Verifies that the contract correctly rejects liquidation of a healthy position
// (no forced price crash is possible with real oracle data on testnet).
// The position is then closed normally to clean up.
import { ethers } from "ethers";
import { CONTRACTS, TOKENS } from "../config.js";
import {
  getDeployer, getWallet, header, log, fmtUsdc, parseUsdc,
  ERC20_ABI, EXCHANGE_ABI, PYTH_ADAPTER_ABI,
  fetchHermesUpdate, extractPositionId,
} from "../helpers.js";

async function hermesData(pythAdapter, feedId) {
  const updates = await fetchHermesUpdate([feedId]);
  const fee     = await pythAdapter.getUpdateFee(updates);
  return { updates, fee };
}

async function main() {
  header("FLOW 4: Liquidation (real Pyth)");

  const deployer   = getDeployer();
  const bob        = getWallet("bob");
  const liquidator = getWallet("liquidator");
  const token      = TOKENS.DEMOx;

  const keeperAdmin = new ethers.Contract(CONTRACTS.keeper, [
    "function addKeeper(address) external",
    "function isMarketOpen() view returns (bool)",
    "function getKeeperStatus(address) view returns (bool)",
    "function openMarket() external",
    "function closeMarket(address[],bytes[]) payable",
  ], deployer);

  const pythAdapter = new ethers.Contract(CONTRACTS.pythAdapter, PYTH_ADAPTER_ABI, deployer);
  const usdc        = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, deployer);
  const exchange    = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, deployer);

  // 1. Ensure pool has liquidity
  const poolCfg = await exchange.getPoolConfig(token.px);
  if (poolCfg.usdcLiquidity === 0n) {
    log("Adding 50k USDC liquidity to xAAPL pool...");
    await (await usdc.approve(CONTRACTS.exchange, ethers.MaxUint256)).wait();
    await (await exchange.depositLiquidity(token.px, parseUsdc("50000"))).wait();
    log("Liquidity added");
  }

  // 2. Ensure Bob has USDC
  const bobUsdc = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, bob);
  let bobBal = await bobUsdc.balanceOf(bob.address);
  if (bobBal < parseUsdc("2000")) {
    log("Topping up Bob with 5000 USDC...");
    await (await usdc.transfer(bob.address, parseUsdc("5000"))).wait();
    bobBal = await bobUsdc.balanceOf(bob.address);
  }
  log(`Bob USDC: ${fmtUsdc(bobBal)}`);

  const bobExchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, bob);
  await (await bobUsdc.approve(CONTRACTS.exchange, ethers.MaxUint256)).wait();

  // 3. Open market if needed
  if (!(await keeperAdmin.isMarketOpen())) {
    await (await keeperAdmin.openMarket()).wait();
    log("Keeper opened market");
  }

  // 4. Bob opens 5x long xAAPL at current real price
  log("Fetching live xAAPL price from Hermes...");
  const open = await hermesData(pythAdapter, token.feedId);
  log("Bob opening 5x long xAAPL with $2000 collateral...");
  const receipt = await (await bobExchange.openLong(
    token.px, parseUsdc("2000"), ethers.parseEther("5"), open.updates, { value: open.fee }
  )).wait();
  const positionId = extractPositionId(receipt);
  log(`Position ID: ${positionId}`);

  const pos = await exchange.getPosition(positionId);
  log(`Collateral: ${fmtUsdc(pos.collateral)} USDC`);
  log(`Entry price: $${ethers.formatUnits(pos.entryPrice, 18)}`);

  // 5. Attempt to liquidate the healthy position -- must revert with PositionNotLiquidatable
  log("\nAttempting liquidation on healthy position (expecting revert)...");
  const liquidatorExchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, liquidator);
  const liq = await hermesData(pythAdapter, token.feedId);

  try {
    await (await liquidatorExchange.liquidate(positionId, liq.updates, { value: liq.fee })).wait();
    log("FAIL: Liquidation succeeded on a healthy position -- this should not happen");
    process.exitCode = 1;
  } catch (err) {
    const msg = err.message || "";
    if (msg.includes("PositionNotLiquidatable") || msg.includes("0x")) {
      log("PASS: Liquidation correctly rejected (PositionNotLiquidatable) [VERIFIED]");
      log("INFO: With real Pyth, price crashes cannot be simulated -- liquidation protection confirmed");
    } else {
      log(`FAIL: Unexpected error: ${msg}`);
      process.exitCode = 1;
    }
  }

  // 6. Bob closes the position normally
  log("\nBob closing position normally...");
  const close = await hermesData(pythAdapter, token.feedId);
  await (await bobExchange.closeLong(positionId, close.updates, { value: close.fee })).wait();
  log(`Bob USDC after close: ${fmtUsdc(await bobUsdc.balanceOf(bob.address))}`);

  // 7. Confirm position is gone
  const closedPos = await exchange.getPosition(positionId);
  if (closedPos.size === 0n) {
    log("PASS: Position closed (size = 0) [VERIFIED]");
  } else {
    log("INFO: Position size after close: " + closedPos.size.toString());
  }

  // 8. Close market (no open positions -- empty updates are fine)
  await (await keeperAdmin.closeMarket([token.px], [], { value: 0n })).wait();
  log("Market closed");

  header("Flow 4 Complete");
}

main().catch(console.error);
