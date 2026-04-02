// Flow 2: Open long and short positions using real Pyth prices, then close them.
// Price moves are replaced by fresh Hermes fetches; PnL reflects actual market movement.
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
  header("FLOW 2: Trading - Open / Close Long & Short (real Pyth)");

  const deployer  = getDeployer();
  const bob       = getWallet("bob");
  const tokenCfg  = TOKENS.AAPLx;
  const spyCfg    = TOKENS.SPYx;

  const pythAdapter = new ethers.Contract(CONTRACTS.pythAdapter, PYTH_ADAPTER_ABI, deployer);
  const usdc        = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, deployer);
  const exchange    = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, deployer);

  // 1. Ensure pools have liquidity
  const aaplPool = await exchange.getPoolConfig(tokenCfg.px);
  const spyPool  = await exchange.getPoolConfig(spyCfg.px);

  if (aaplPool.usdcLiquidity === 0n) {
    log("Adding 200k USDC liquidity to xAAPL pool...");
    await (await usdc.approve(CONTRACTS.exchange, ethers.MaxUint256)).wait();
    await (await exchange.depositLiquidity(tokenCfg.px, parseUsdc("200000"))).wait();
    log("xAAPL pool funded");
  }
  if (spyPool.usdcLiquidity === 0n) {
    log("Adding 200k USDC liquidity to xSPY pool...");
    await (await usdc.approve(CONTRACTS.exchange, ethers.MaxUint256)).wait();
    await (await exchange.depositLiquidity(spyCfg.px, parseUsdc("200000"))).wait();
    log("xSPY pool funded");
  }

  // 2. Fund Bob with USDC
  const bobUsdc = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, bob);
  let bobBal = await bobUsdc.balanceOf(bob.address);
  if (bobBal < parseUsdc("6000")) {
    log("Funding Bob with 20k USDC...");
    await (await usdc.transfer(bob.address, parseUsdc("20000"))).wait();
    bobBal = await bobUsdc.balanceOf(bob.address);
  }
  log(`Bob USDC: ${fmtUsdc(bobBal)}`);

  // 3. Bob approves exchange
  await (await bobUsdc.approve(CONTRACTS.exchange, ethers.MaxUint256)).wait();
  log("Bob approved exchange");

  // 4. Keeper opens market
  const keeperAdmin = new ethers.Contract(CONTRACTS.keeper, [
    "function addKeeper(address) external",
    "function isMarketOpen() view returns (bool)",
    "function getKeeperStatus(address) view returns (bool)",
    "function openMarket() external",
    "function closeMarket(address[],bytes[]) payable",
  ], deployer);

  const keeperBot = getWallet("keeperBot");
  if (!(await keeperAdmin.getKeeperStatus(keeperBot.address))) {
    await (await keeperAdmin.addKeeper(keeperBot.address)).wait();
    log("KeeperBot added as keeper");
  }

  if (!(await keeperAdmin.isMarketOpen())) {
    await (await keeperAdmin.openMarket()).wait();
    log("Keeper opened market");
  } else {
    log("Market already open");
  }

  // 5. Bob opens 3x long xAAPL with $3000 collateral (price fetched from Hermes)
  const bobExchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, bob);
  const collateral  = parseUsdc("3000");

  log("Fetching live xAAPL price from Hermes...");
  const aapl1 = await hermesData(pythAdapter, tokenCfg.feedId);
  log("Bob opening 3x long xAAPL...");
  const longTx      = await bobExchange.openLong(tokenCfg.px, collateral, ethers.parseEther("3"), aapl1.updates, { value: aapl1.fee });
  const longReceipt = await longTx.wait();
  const longPositionId = extractPositionId(longReceipt);
  log(`Long position ID: ${longPositionId}`);

  // 6. Bob opens 2x short xSPY with $3000 collateral
  log("Fetching live xSPY price from Hermes...");
  const spy1 = await hermesData(pythAdapter, spyCfg.feedId);
  log("Bob opening 2x short xSPY...");
  const shortTx      = await bobExchange.openShort(spyCfg.px, collateral, ethers.parseEther("2"), spy1.updates, { value: spy1.fee });
  const shortReceipt = await shortTx.wait();
  const shortPositionId = extractPositionId(shortReceipt);
  log(`Short position ID: ${shortPositionId}`);

  log(`Bob USDC after opens: ${fmtUsdc(await bobUsdc.balanceOf(bob.address))}`);

  // 7. Close long (fresh Hermes fetch reflects current real price)
  log("Fetching fresh xAAPL price for close...");
  const aapl2 = await hermesData(pythAdapter, tokenCfg.feedId);
  log("Bob closing long...");
  await (await bobExchange.closeLong(longPositionId, aapl2.updates, { value: aapl2.fee })).wait();
  log(`Bob USDC after close long: ${fmtUsdc(await bobUsdc.balanceOf(bob.address))}`);

  // 8. Close short
  log("Fetching fresh xSPY price for close...");
  const spy2 = await hermesData(pythAdapter, spyCfg.feedId);
  log("Bob closing short...");
  await (await bobExchange.closeShort(shortPositionId, spy2.updates, { value: spy2.fee })).wait();

  const finalBal = await bobUsdc.balanceOf(bob.address);
  log(`Bob final USDC: ${fmtUsdc(finalBal)}`);
  log("PASS: Long and short opened and closed with real Pyth prices [VERIFIED]");

  // 9. Close market (no open positions -- empty updates are fine)
  await (await keeperAdmin.closeMarket([tokenCfg.px, spyCfg.px], [], { value: 0n })).wait();
  log("Market closed");

  header("Flow 2 Complete");
}

main().catch(console.error);
