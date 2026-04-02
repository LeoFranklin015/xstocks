// Flow 1: Deposit xStock into Vault -> get px + dx tokens
import { ethers } from "ethers";
import { CONTRACTS, TOKENS } from "../config.js";
import {
  getDeployer, getWallet, header, log, fmt,
  ERC20_ABI, VAULT_ABI,
} from "../helpers.js";

async function main() {
  header("FLOW 1: Deposit xStock -> Vault Split");

  const deployer = getDeployer();
  const alice = getWallet("alice");
  const token = TOKENS.AAPLx;

  // 1. Transfer some xAAPL from deployer to Alice
  const xStock = new ethers.Contract(token.xStock, ERC20_ABI, deployer);
  const transferAmt = ethers.parseEther("10");

  log(`Transferring 10 AAPLxt to Alice...`);
  let tx = await xStock.transfer(alice.address, transferAmt);
  await tx.wait();

  const aliceXStock = new ethers.Contract(token.xStock, ERC20_ABI, alice);
  log(`Alice AAPLxt balance: ${fmt(await aliceXStock.balanceOf(alice.address))}`);

  // 2. Alice approves vault
  const vault = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, alice);
  tx = await aliceXStock.approve(CONTRACTS.vault, ethers.MaxUint256);
  await tx.wait();
  log("Alice approved vault");

  // 3. Alice deposits 5 AAPLxt
  const depositAmt = ethers.parseEther("5");
  log(`Alice depositing 5 AAPLxt...`);
  tx = await vault.deposit(token.xStock, depositAmt);
  const receipt = await tx.wait();
  log(`Deposit tx: ${receipt.hash}`);

  // 4. Check px and dx balances
  const px = new ethers.Contract(token.px, ERC20_ABI, alice);
  const dx = new ethers.Contract(token.dx, ERC20_ABI, alice);

  const pxBal = await px.balanceOf(alice.address);
  const dxBal = await dx.balanceOf(alice.address);

  log(`Alice pxAAPL: ${fmt(pxBal)}`);
  log(`Alice dxAAPL: ${fmt(dxBal)}`);
  log(`Alice AAPLxt remaining: ${fmt(await aliceXStock.balanceOf(alice.address))}`);

  // 5. Check vault config
  const config = await vault.getAssetConfig(token.xStock);
  log(`Vault totalDeposited: ${fmt(config.totalDeposited)}`);
  log(`Vault lastMultiplier: ${fmt(config.lastMultiplier)}`);

  if (pxBal === depositAmt && dxBal === depositAmt) {
    log("PASS: 1 xStock = 1 px + 1 dx [VERIFIED]");
  } else {
    log("FAIL: px/dx mismatch!");
  }

  header("Flow 1 Complete");
}

main().catch(console.error);
