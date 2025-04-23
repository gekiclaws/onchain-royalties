// scripts/revenueFlowDemo.js
//
// Full “fund → distribute → fan claim” flow demo
//

const hre        = require("hardhat");
const { ethers } = hre;

async function main() {
  // ─── Config ──────────────────────────────────────────────────────────────
  const CONTRACT = process.env.CONTRACT;
  if (!CONTRACT) throw new Error("Set CONTRACT env var to your deployed address");
  const FUND_ETH  = "5";

  // ─── Setup ────────────────────────────────────────────────────────────────
  const signers  = await ethers.getSigners();
  const deployer = signers[0];
  const royalty  = await ethers.getContractAt("RoyaltySplitterDemo", CONTRACT);
  const addr     = await royalty.getAddress();
  const getBal   = a => ethers.provider.getBalance(a);
  const fmt      = b => ethers.formatEther(b);

  console.log("👷 Deployer:", deployer.address);
  console.log("🏛 Contract:", addr);

  // ─── 1. Fetch payees ───────────────────────────────────────────────────────
  console.log("\n🔎 Fetching payees…");
  const [accounts, weights] = await royalty.getPayees();
  if (accounts.length === 0) throw new Error("No payees returned!");
  const payees = accounts.map((acct, i) => ({ acct, weight: weights[i] }));
  payees.forEach((p, i) =>
    console.log(`   • [${i}] ${p.acct} (share: ${p.weight}% )`)
  );

  // Capture pre-distribution balances
  const payeePre = {};
  for (const { acct } of payees) {
    payeePre[acct] = await getBal(acct);
  }

  // ─── 2. Initial contract balance ───────────────────────────────────────────
  let cBal = await getBal(addr);
  console.log("\n🔎 Pre-fund balance:", fmt(cBal), "ETH");

  // ─── 3. Fund the contract ─────────────────────────────────────────────────
  console.log(`\n💸 Funding contract with ${FUND_ETH} ETH…`);
  await (
    await deployer.sendTransaction({
      to: addr,
      value: ethers.parseEther(FUND_ETH),
    })
  ).wait();
  cBal = await getBal(addr);
  console.log("   → New balance:", fmt(cBal), "ETH");

  // ─── 4. Distribute ────────────────────────────────────────────────────────
  console.log("\n📤 Calling distribute()…");
  await (await royalty.distribute()).wait();

  // ─── 5. Log payee payouts ─────────────────────────────────────────────────
  console.log("\n🎯 Payee payouts:");
  for (const { acct } of payees) {
    const post  = await getBal(acct);
    console.log(
      `   • ${acct} received ${fmt(post - payeePre[acct])} ETH`
    );
  }

  // ─── 6. Post-distribute state ─────────────────────────────────────────────
  cBal = await getBal(addr);
  const fanPool = await royalty.totalFanPool();
  console.log("\n🔎 After distribute:");
  console.log("   • contract balance:", fmt(cBal), "ETH");
  console.log("   • totalFanPool   :", fmt(fanPool), "ETH");

  // ─── 7. Fans claim ────────────────────────────────────────────────────────
  const fanShareBps = await royalty.fanShareBPS();
  const fanBps = parseInt(fanShareBps.toString())/100;
  console.log(`\n🎉 Fans claim ${fanBps}% of total revenue pool`);
  for (let idx of [1, 2]) {
    const fan = signers[idx];
    await (await royalty.connect(fan).claimFan()).wait();
    const claimed = await royalty.fanClaimed(fan.address);
    console.log(`   • ${fan.address} claimed ${fmt(claimed)} ETH`);
  }

  // ─── 8. Final balance ─────────────────────────────────────────────────────
  cBal = await getBal(addr);
  console.log("\n🔎 Final contract balance:", fmt(cBal), "ETH");
  console.log("\n✅ All done—funds distributed, fans & payees paid.\n");
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});