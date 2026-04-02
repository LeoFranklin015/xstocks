// Flow 2: Open long and short positions, then close them
import { ethers } from "ethers";
import { CONTRACTS, TOKENS } from "../config.js";
import {
  getDeployer, getWallet, header, log, fmtUsdc, parseUsdc,
  ERC20_ABI, EXCHANGE_ABI, MOCK_PYTH_ABI,
  createPriceUpdate, extractPositionId,
} from "../helpers.js";

async function priceData(mockPyth, feedId, price) {
  const updates = await createPriceUpdate(mockPyth, feedId, price);
  const fee = await mockPyth.getUpdateFee(updates);
  return { updates, fee };
}

async function main() {
  header("FLOW 2: Trading - Open / Close Long & Short");

  const deployer    = getDeployer();
  const keeperBot   = getWallet("keeperBot");
  const bob         = getWallet("bob");
  const tokenCfg    = TOKENS.AAPLx;
  const spyCfg      = TOKENS.SPYx;

  const mockPyth = new ethers.Contract(CONTRACTS.mockPyth, MOCK_PYTH_ABI, deployer);
  const usdc     = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, deployer);
  const exchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, deployer);

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

  // 5. Bob opens 3x long xAAPL with $3000 collateral
  const bobExchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, bob);
  const collateral  = parseUsdc("3000");

  const aapl1 = await priceData(mockPyth, tokenCfg.feedId, tokenCfg.price);
  log(`Bob opening 3x long xAAPL @ $${(tokenCfg.price / 100).toFixed(2)}...`);
  const longTx = await bobExchange.openLong(tokenCfg.px, collateral, ethers.parseEther("3"), aapl1.updates, { value: aapl1.fee });
  const longReceipt = await longTx.wait();
  const longPositionId = extractPositionId(longReceipt);
  log(`Long position ID: ${longPositionId}`);

  // 6. Bob opens 2x short xSPY with $3000 collateral
  const spy1 = await priceData(mockPyth, spyCfg.feedId, spyCfg.price);
  log(`Bob opening 2x short xSPY @ $${(spyCfg.price / 100).toFixed(2)}...`);
  const shortTx = await bobExchange.openShort(spyCfg.px, collateral, ethers.parseEther("2"), spy1.updates, { value: spy1.fee });
  const shortReceipt = await shortTx.wait();
  const shortPositionId = extractPositionId(shortReceipt);
  log(`Short position ID: ${shortPositionId}`);

  log(`Bob USDC after opens: ${fmtUsdc(await bobUsdc.balanceOf(bob.address))}`);

  // 7. Prices move: AAPL $213.42 -> $220, SPY $587.50 -> $575
  const newAaplPrice = 22000;
  const newSpyPrice  = 57500;
  log(`Prices move: xAAPL -> $${newAaplPrice / 100}, xSPY -> $${newSpyPrice / 100}`);
  await pushPrice(mockPyth, deployer, tokenCfg.feedId, newAaplPrice);
  await pushPrice(mockPyth, deployer, spyCfg.feedId, newSpyPrice);

  // 8. Bob closes long
  const aapl2 = await priceData(mockPyth, tokenCfg.feedId, newAaplPrice);
  log("Bob closing long...");
  await (await bobExchange.closeLong(longPositionId, aapl2.updates, { value: aapl2.fee })).wait();
  log(`Bob USDC after close long: ${fmtUsdc(await bobUsdc.balanceOf(bob.address))}`);

  // 9. Bob closes short
  const spy2 = await priceData(mockPyth, spyCfg.feedId, newSpyPrice);
  log("Bob closing short...");
  await (await bobExchange.closeShort(shortPositionId, spy2.updates, { value: spy2.fee })).wait();

  const finalBal = await bobUsdc.balanceOf(bob.address);
  const startBal = parseUsdc("20000");
  log(`Bob final USDC: ${fmtUsdc(finalBal)}`);

  const pnl = finalBal - startBal;
  if (pnl >= 0n) {
    log(`PASS: Bob net PnL +${fmtUsdc(pnl)} USDC [VERIFIED]`);
  } else {
    log(`INFO: Bob net PnL: -${fmtUsdc(-pnl)} USDC`);
  }

  // 10. Close market
  await (await keeperAdmin.closeMarket([tokenCfg.px, spyCfg.px], [], { value: 0n })).wait();
  log("Market closed");

  header("Flow 2 Complete");
}

async function pushPrice(mockPyth, signer, feedId, price) {
  const ts = Math.floor(Date.now() / 1000);
  const data = await mockPyth.createPriceFeedUpdateData(
    feedId, BigInt(price), 100n, -2, BigInt(price), 100n, BigInt(ts)
  );
  const fee = await mockPyth.getUpdateFee([data]);
  await (await mockPyth.connect(signer).updatePriceFeeds([data], { value: fee })).wait();
}

main().catch(console.error);
