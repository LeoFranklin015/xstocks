// Flow 5: Recombination - burn px + dx -> get xStock back
import { ethers } from "ethers";
import { CONTRACTS, TOKENS } from "../config.js";
import {
  getDeployer, getWallet, header, log, fmt,
  ERC20_ABI, VAULT_ABI,
} from "../helpers.js";

async function main() {
  header("FLOW 5: Recombination - px + dx -> xStock");

  const deployer = getDeployer();
  const alice = getWallet("alice");
  const token = TOKENS.DEMOx; // Use deployer-owned token for full flow control

  const aliceVault  = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, alice);
  const px          = new ethers.Contract(token.px, ERC20_ABI, alice);
  const dx          = new ethers.Contract(token.dx, ERC20_ABI, alice);
  const aliceXStock = new ethers.Contract(token.xStock, ERC20_ABI, alice);

  let pxBal = await px.balanceOf(alice.address);
  let dxBal = await dx.balanceOf(alice.address);
  log(`Alice pxAAPL: ${fmt(pxBal)}`);
  log(`Alice dxAAPL: ${fmt(dxBal)}`);

  // If Alice has no tokens, do a deposit first so this flow is self-contained
  if (pxBal === 0n || dxBal === 0n) {
    log("Alice missing px or dx -- performing deposit first");
    const xStock = new ethers.Contract(token.xStock, ERC20_ABI, deployer);
    let tx = await xStock.transfer(alice.address, ethers.parseEther("10"));
    await tx.wait();

    const aliceXs = new ethers.Contract(token.xStock, ERC20_ABI, alice);
    tx = await aliceXs.approve(CONTRACTS.vault, ethers.MaxUint256);
    await tx.wait();
    tx = await aliceVault.deposit(token.xStock, ethers.parseEther("5"));
    await tx.wait();

    pxBal = await px.balanceOf(alice.address);
    dxBal = await dx.balanceOf(alice.address);
    log(`After deposit -- pxAAPL: ${fmt(pxBal)}, dxAAPL: ${fmt(dxBal)}`);
  }

  // Use the minimum of px and dx to recombine (must be equal)
  const withdrawAmt = pxBal < dxBal ? pxBal : dxBal;
  log(`\nRecombining ${fmt(withdrawAmt)} px+dx -> xAAPL...`);

  // Approve vault to spend px and dx
  let tx = await px.approve(CONTRACTS.vault, withdrawAmt);
  await tx.wait();
  // dx approve is not needed since vault burns it internally via the DividendToken callback
  // but we approve anyway for safety
  const dxContract = new ethers.Contract(token.dx, ERC20_ABI, alice);
  tx = await dxContract.approve(CONTRACTS.vault, withdrawAmt);
  await tx.wait();
  log("Approved vault for px and dx");

  // Snapshot xStock balance
  const xStockBefore = await aliceXStock.balanceOf(alice.address);
  log(`Alice xAAPL before recombine: ${fmt(xStockBefore)}`);

  // Withdraw (recombine)
  tx = await aliceVault.withdraw(token.xStock, withdrawAmt);
  await tx.wait();

  const xStockAfter = await aliceXStock.balanceOf(alice.address);
  const pxAfter = await px.balanceOf(alice.address);
  const dxAfter = await dx.balanceOf(alice.address);

  log(`Alice xAAPL after recombine: ${fmt(xStockAfter)}`);
  log(`Alice pxAAPL remaining: ${fmt(pxAfter)}`);
  log(`Alice dxAAPL remaining: ${fmt(dxAfter)}`);

  const received = xStockAfter - xStockBefore;
  log(`xAAPL received: ${fmt(received)}`);

  // Validate 1:1:1 invariant: withdrawAmt px + withdrawAmt dx -> withdrawAmt xStock
  if (received === withdrawAmt) {
    log("PASS: 1:1:1 recombination invariant [VERIFIED]");
  } else {
    // Allow for small rounding from dividend auto-claim
    const diff = received > withdrawAmt ? received - withdrawAmt : withdrawAmt - received;
    if (diff < ethers.parseEther("0.01")) {
      log(`PASS: Recombination within rounding tolerance (diff: ${fmt(diff)}) [VERIFIED]`);
    } else {
      log(`FAIL: Got ${fmt(received)} but expected ${fmt(withdrawAmt)}`);
    }
  }

  // Check vault state
  const vault = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, deployer);
  const config = await vault.getAssetConfig(token.xStock);
  log(`\nVault totalDeposited after: ${fmt(config.totalDeposited)}`);

  header("Flow 5 Complete");
}

main().catch(console.error);
