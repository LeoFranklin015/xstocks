// Flow 3: Dividend event - setMultiplier, syncDividend, pendingDividend, claimDividend
import { ethers } from "ethers";
import { CONTRACTS, TOKENS } from "../config.js";
import {
  getDeployer, getWallet, header, log, fmt,
  ERC20_ABI, VAULT_ABI,
} from "../helpers.js";

const XSTOCK_ABI = [
  "function setMultiplier(uint256) external",
  "function multiplier() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address,uint256) external",
];

async function main() {
  header("FLOW 3: Dividend Event");

  const deployer = getDeployer();
  const alice = getWallet("alice");
  const token = TOKENS.DEMOx; // Use deployer-owned demo token for dividend control

  // Alice needs some dx tokens to be eligible for dividends.
  // She should have them from Flow 1 (deposit). Check first.
  const dx = new ethers.Contract(token.dx, ERC20_ABI, alice);
  const px = new ethers.Contract(token.px, ERC20_ABI, alice);
  let dxBal = await dx.balanceOf(alice.address);
  log(`Alice dxDEMO before: ${fmt(dxBal)}`);

  if (dxBal === 0n) {
    // Re-do the deposit for this flow to be self-contained
    log("Alice has no dx tokens -- performing deposit first");
    const xStock = new ethers.Contract(token.xStock, ERC20_ABI, deployer);
    const transferAmt = ethers.parseEther("10");
    let tx = await xStock.transfer(alice.address, transferAmt);
    await tx.wait();

    const aliceXStock = new ethers.Contract(token.xStock, ERC20_ABI, alice);
    const vault = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, alice);
    tx = await aliceXStock.approve(CONTRACTS.vault, ethers.MaxUint256);
    await tx.wait();

    const depositAmt = ethers.parseEther("5");
    tx = await vault.deposit(token.xStock, depositAmt);
    await tx.wait();

    dxBal = await dx.balanceOf(alice.address);
    log(`Alice dxDEMO after deposit: ${fmt(dxBal)}`);
  }

  // 1. Snapshot balances
  const xStockDeployer = new ethers.Contract(token.xStock, ERC20_ABI, deployer);
  log(`Deployer DEMOx: ${fmt(await xStockDeployer.balanceOf(deployer.address))}`);

  // 2. Check current multiplier
  const xStockToken = new ethers.Contract(token.xStock, XSTOCK_ABI, deployer);
  const multBefore = await xStockToken.multiplier();
  log(`DEMOx multiplier before: ${fmt(multBefore)}`);

  // 3. Simulate a dividend rebase: add 0.00117 to current multiplier (~$0.25/share)
  // Multiplier must always INCREASE (dividends accumulate)
  const increase = ethers.parseEther("0.00117");
  const newMultiplier = multBefore + increase;
  log(`Setting multiplier to ${fmt(newMultiplier)} (simulating $0.25 dividend)...`);
  let tx = await xStockToken.setMultiplier(newMultiplier);
  await tx.wait();
  log(`New multiplier: ${fmt(await xStockToken.multiplier())}`);

  // 4. Deployer sends extra xAAPL to vault to fund dividend payouts
  // The vault needs xAAPL balance > totalDeposited to pay dividends
  const vault = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, deployer);
  const config = await vault.getAssetConfig(token.xStock);
  log(`Vault totalDeposited: ${fmt(config.totalDeposited)}`);

  const extraFund = ethers.parseEther("10");
  tx = await xStockDeployer.transfer(CONTRACTS.vault, extraFund);
  await tx.wait();
  log(`Transferred ${fmt(extraFund)} DEMOx to vault for dividend funding`);

  // 5. Sync dividend accumulator
  log("Syncing dividend accumulator...");
  const deployerVault = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, deployer);
  tx = await deployerVault.syncDividend(token.xStock);
  await tx.wait();
  log("syncDividend complete");

  // 6. Check pending dividend for Alice
  const pending = await vault.pendingDividend(token.xStock, alice.address);
  log(`Alice pending dividend: ${fmt(pending)} xAAPL`);

  // 7. Alice claims dividend
  const aliceXStock = new ethers.Contract(token.xStock, ERC20_ABI, alice);
  const xStockBefore = await aliceXStock.balanceOf(alice.address);
  log(`Alice xAAPL before claim: ${fmt(xStockBefore)}`);

  const aliceVault = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, alice);
  tx = await aliceVault.claimDividend(token.xStock);
  await tx.wait();

  const xStockAfter = await aliceXStock.balanceOf(alice.address);
  log(`Alice xAAPL after claim: ${fmt(xStockAfter)}`);

  const received = xStockAfter - xStockBefore;
  log(`Alice received: ${fmt(received)} xAAPL`);

  if (received > 0n) {
    log("PASS: Alice received dividend [VERIFIED]");
  } else {
    log("FAIL: No dividend received");
  }

  // 8. Confirm pending is now 0
  const pendingAfter = await vault.pendingDividend(token.xStock, alice.address);
  log(`Alice pending after claim: ${fmt(pendingAfter)}`);

  header("Flow 3 Complete");
}

main().catch(console.error);
