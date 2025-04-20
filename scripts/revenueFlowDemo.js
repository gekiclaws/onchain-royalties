// scripts/revenueFlowWithState.js
//
// Automated flow + state‑logging for RoyaltySplitterDemo
//
// 1. Log initial contract balance
// 2. Fund contract
// 3. Distribute to payees & fan pool
// 4. Log post‑distribute state (contract balance, totalFanPool)
// 5. Mint fan tokens
// 6. Log fan balances + mockFanTotalSupply
// 7. Fans claim
// 8. Log fanClaimed + final contract balance
//
// USAGE:
//   CONTRACT=0xYourContractAddress npx hardhat run scripts/revenueFlowWithState.js --network localhost
//

const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  // ─── Config ──────────────────────────────────────────────────────────────
  const CONTRACT = process.env.CONTRACT;
  if (!CONTRACT) throw new Error("Set CONTRACT env var to your deployed address");

  const FUND_ETH  = "5";               // how much ETH to send
  const FAN_MINTS = [                  // which signers get how many “mock tokens”
    { idx: 1, amount: 1000 },          // signer #1
    { idx: 2, amount: 500  },          // signer #2
  ];

  // ─── Signers & Contract ──────────────────────────────────────────────────
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const fans     = FAN_MINTS.map(f => signers[f.idx]);
  const royalty  = await ethers.getContractAt("RoyaltySplitterDemo", CONTRACT);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const getBal    = addr => ethers.provider.getBalance(addr);
  const fmt       = bn   => ethers.formatEther(bn);

  console.log("\n👷‍♂️ Deployer:", deployer.address);
  console.log("🏛 Contract:", await royalty.getAddress());

  // ─── 1. Initial state ────────────────────────────────────────────────────
  let cBal = await getBal(royalty.target);
  console.log("\n🔎 Initial contract balance:", fmt(cBal), "ETH");

  // ─── 2. Fund the contract ────────────────────────────────────────────────
  console.log(`\n💸 Funding contract with ${FUND_ETH} ETH …`);
  await (
    await deployer.sendTransaction({
      to: royalty.target,
      value: ethers.parseEther(FUND_ETH),
    })
  ).wait();
  cBal = await getBal(royalty.target);
  console.log("   → New contract balance:", fmt(cBal), "ETH");

  // ─── 3. Distribute() ─────────────────────────────────────────────────────
  console.log("\n📤 Calling distribute() …");
  await (await royalty.distribute()).wait();

  // ─── 4. Post‑distribute state ────────────────────────────────────────────
  cBal = await getBal(royalty.target);
  const totalFanPool      = await royalty.totalFanPool();
  console.log("\n🔎 After distribute:");
  console.log("   • contract balance:", fmt(cBal), "ETH");
  console.log("   • totalFanPool   :", fmt(totalFanPool), "ETH");

  // ─── 5. Mint fan tokens ──────────────────────────────────────────────────
  console.log("\n🎫 Minting fan tokens …");
  for (const { idx, amount } of FAN_MINTS) {
    const addr = signers[idx].address;
    console.log(`   • mintFan(${addr}, ${amount})`);
    await (await royalty.mintFan(addr, amount)).wait();
  }

  // ─── 6. Fan token state ──────────────────────────────────────────────────
  const mockTotal = await royalty.mockFanTotalSupply();
  console.log("\n🔎 Fan‑token state:");
  console.log("   • mockFanTotalSupply:", mockTotal.toString());
  for (const fan of fans) {
    const bal = await royalty.fanBalance(fan.address);
    console.log(`   • fanBalance[${fan.address}]:`, bal.toString());
  }

  // ─── 7. claimFan() ───────────────────────────────────────────────────────
  console.log("\n🎉 Fans claiming …");
  for (const fan of fans) {
    console.log(`   • ${fan.address} → claimFan()`);
    await (await royalty.connect(fan).claimFan()).wait();
  }

  // ─── 8. Final state ──────────────────────────────────────────────────────
  cBal = await getBal(royalty.target);
  console.log("\n🔎 Final contract balance:", fmt(cBal), "ETH");
  console.log("🔎 fanClaimed per fan:");
  for (const fan of fans) {
    const claimed = await royalty.fanClaimed(fan.address);
    console.log(`   • ${fan.address}:`, fmt(claimed), "ETH");
  }

  console.log("\n✅  All done – internal state fully logged.\n");
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
