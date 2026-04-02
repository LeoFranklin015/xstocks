// Flow 4: Liquidation - open underwater position, liquidate it
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
  header("FLOW 4: Liquidation");

  const deployer   = getDeployer();
  const bob        = getWallet("bob");
  const liquidator = getWallet("liquidator");
  const token = TOKENS.DEMOx;

  const keeperAdmin = new ethers.Contract(CONTRACTS.keeper, [
    "function addKeeper(address) external",
    "function isMarketOpen() view returns (bool)",
    "function getKeeperStatus(address) view returns (bool)",
    "function openMarket() external",
    "function closeMarket(address[],bytes[]) payable",
  ], deployer);

  const mockPyth = new ethers.Contract(CONTRACTS.mockPyth, MOCK_PYTH_ABI, deployer);
  const usdc     = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, deployer);
  const exchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, deployer);

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

  // 4. Bob opens 5x long xAAPL @ $220 with $2000 collateral
  const openPrice = 22000;
  const open = await priceData(mockPyth, token.feedId, openPrice);
  log(`Bob opening 5x long xAAPL @ $${openPrice / 100}...`);
  const receipt = await (await bobExchange.openLong(
    token.px, parseUsdc("2000"), ethers.parseEther("5"), open.updates, { value: open.fee }
  )).wait();
  const positionId = extractPositionId(receipt);
  log(`Position ID: ${positionId}`);

  const pos = await exchange.getPosition(positionId);
  log(`Collateral: ${fmtUsdc(pos.collateral)} USDC`);
  log(`Entry price: $${ethers.formatUnits(pos.entryPrice, 18)}`);

  // 5. Price crashes: $220 -> $180 (loss > 80% of collateral)
  const crashPrice = 18000;
  log(`\nPrice crashes: xAAPL $${openPrice / 100} -> $${crashPrice / 100}`);
  await pushPrice(mockPyth, deployer, token.feedId, crashPrice);

  // 6. Liquidator liquidates the position
  const liquidatorExchange = new ethers.Contract(CONTRACTS.exchange, EXCHANGE_ABI, liquidator);
  const liquidatorUsdc = new ethers.Contract(CONTRACTS.usdc, ERC20_ABI, liquidator);

  const liqBefore = await liquidatorUsdc.balanceOf(liquidator.address);
  log(`Liquidator USDC before: ${fmtUsdc(liqBefore)}`);

  const liq = await priceData(mockPyth, token.feedId, crashPrice);
  log("Liquidating position...");
  await (await liquidatorExchange.liquidate(positionId, liq.updates, { value: liq.fee })).wait();

  const liqAfter = await liquidatorUsdc.balanceOf(liquidator.address);
  const reward = liqAfter - liqBefore;
  log(`Liquidator USDC after: ${fmtUsdc(liqAfter)}`);
  log(`Liquidation reward: ${fmtUsdc(reward)} USDC`);

  if (reward > 0n) {
    log("PASS: Liquidation successful, reward received [VERIFIED]");
  } else {
    log("FAIL: No liquidation reward");
  }

  // 7. Confirm position is closed (size = 0)
  const closedPos = await exchange.getPosition(positionId);
  if (closedPos.size === 0n) {
    log("PASS: Position closed (size = 0)");
  } else {
    log("INFO: Position size after liquidation: " + closedPos.size.toString());
  }

  // 8. Close market
  const closeP = await priceData(mockPyth, token.feedId, crashPrice);
  await (await keeperAdmin.closeMarket([token.px], closeP.updates, { value: closeP.fee })).wait();
  log("Market closed");

  header("Flow 4 Complete");
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
