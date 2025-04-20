// scripts/revenueFlowDemo.js
//
// Full “fan mint -> fund → distribute → fan claim” flow demo
//
// USAGE:
//   CONTRACT=0xYourContract npx hardhat run scripts/revenueFlowDemo.js --network localhost
//

const hre   = require("hardhat");
const { ethers } = hre;

async function main() {
  // ─── Config ──────────────────────────────────────────────────────────────
  const CONTRACT = process.env.CONTRACT;
  if (!CONTRACT) throw new Error("Set CONTRACT env var to your deployed address");

  const FUND_ETH  = "5";        // ETH to send after minting fans
  const FAN_MINTS = [           // [signerIndex, mock‑token amount]
    { idx: 1, amount: 1000 },
    { idx: 2, amount: 500  },
  ];

  // ─── Setup ────────────────────────────────────────────────────────────────
  const signers  = await ethers.getSigners();
  const deployer = signers[0];
  const owner = signers[1]; // main artist is the owner
  const royalty  = await ethers.getContractAt("RoyaltySplitterDemo", CONTRACT);
  const addr     = await royalty.getAddress();
  const getBal   = a => ethers.provider.getBalance(a);
  const fmt      = b => ethers.formatEther(b);

  console.log("\n👷‍♂️  Deployer:", deployer.address);
  console.log("🏛 Contract:", addr);

  // ─── 1. Fetch payees via getPayees() ───────────────────────────────────────
  console.log("\n🔎 Fetching payees via getPayees() …");
  const [accounts, weights] = await royalty.getPayees();
  if (accounts.length === 0) throw new Error("No payees returned!");
  const payees = accounts.map((acct, i) => ({ acct, weight: weights[i] }));
  payees.forEach((p, i) => {
    console.log(`   • [${i}] ${p.acct} (weight ${p.weight.toString()})`);
  });

  // Capture pre‑distribution balances (they’re all zero now)
  const payeePre = {};
  for (const p of payees) payeePre[p.acct] = await getBal(p.acct);

  // ─── 2. Mint fans *before* revenue arrives ────────────────────────────────
  console.log("\n🎫 Minting fan tokens …");
  for (const { idx, amount } of FAN_MINTS) {
    const fanAddr = signers[idx].address;
    console.log(`   • mintFan(${fanAddr}, ${amount})`);
    await (await royalty.connect(owner).mintFan(fanAddr, amount)).wait();
  }

  // Log fan‑token state
  const mockTotal = await royalty.mockFanTotalSupply();
  console.log("\n🔎 Fan‑token state:");
  console.log("   • mockFanTotalSupply:", mockTotal.toString());
  for (const { idx } of FAN_MINTS) {
    const f = signers[idx].address;
    console.log(`   • fanBalance[${f}]:`, (await royalty.fanBalance(f)).toString());
  }

  // ─── 3. Initial contract balance ──────────────────────────────────────────
  let cBal = await getBal(addr);
  console.log("\n🔎 Pre‑fund contract balance:", fmt(cBal), "ETH");

  // ─── 4. Fund the contract ────────────────────────────────────────────────
  console.log(`\n💸 Funding contract with ${FUND_ETH} ETH …`);
  await (
    await deployer.sendTransaction({
      to: addr,
      value: ethers.parseEther(FUND_ETH),
    })
  ).wait();
  cBal = await getBal(addr);
  console.log("   → New contract balance:", fmt(cBal), "ETH");

  // ─── 5. Distribute to payees & fan pool ───────────────────────────────────
  console.log("\n📤 Calling distribute() …");
  await (await royalty.distribute()).wait();

  // ─── 6. Log payee payouts ─────────────────────────────────────────────────
  console.log("\n🎯 Payee payouts:");
  for (const p of payees) {
    const post  = await getBal(p.acct);
    const delta = post - payeePre[p.acct];
    console.log(`   • ${p.acct} received ${fmt(delta)} ETH`);
  }

  // ─── 7. Post‑distribute state ─────────────────────────────────────────────
  cBal = await getBal(addr);
  const totalFanPool = await royalty.totalFanPool();
  console.log("\n🔎 After distribute:");
  console.log("   • contract balance:", fmt(cBal), "ETH");
  console.log("   • totalFanPool   :", fmt(totalFanPool), "ETH");

  // ─── 8. Fans claim ────────────────────────────────────────────────────────
  console.log("\n🎉 Fans claiming …");
  for (const { idx } of FAN_MINTS) {
    const fan = signers[idx];
    await (await royalty.connect(fan).claimFan()).wait();
    const claimed = await royalty.fanClaimed(fan.address);
    console.log(`   • ${fan.address} claimed ${fmt(claimed)} ETH`);
  }

  // ─── 9. Final contract balance ───────────────────────────────────────────
  cBal = await getBal(addr);
  console.log("\n🔎 Final contract balance:", fmt(cBal), "ETH");
  console.log("\n✅  All done – tokens minted before revenue, stakeholders & fans paid.\n");
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});