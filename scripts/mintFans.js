// scripts/mintFans.js
//
// Mint fan tokens to a given list of signers
//

const hre        = require("hardhat");
const { ethers } = hre;

async function main() {
  const CONTRACT  = process.env.CONTRACT;
  if (!CONTRACT) throw new Error("Set CONTRACT env var to your deployed address");

  // ─── Config ──────────────────────────────────────────────────────────────
  const FAN_MINTS = [
    { idx: 1, amount: 1000 },
    { idx: 2, amount:  500 },
  ];

  // ─── Setup ────────────────────────────────────────────────────────────────
  const signers = await ethers.getSigners();
  const owner   = signers[1]; // main artist is the owner
  const royalty = await ethers.getContractAt("RoyaltySplitterDemo", CONTRACT);

  console.log("🔑 Owner:", owner.address);
  console.log("🎫 Minting fan tokens…");

  for (const { idx, amount } of FAN_MINTS) {
    const fanAddr = signers[idx].address;
    console.log(`   • mintFan(${fanAddr}, ${amount})`);
    await (await royalty.connect(owner).mintFan(fanAddr, amount)).wait();
  }

  const total   = await royalty.mockFanTotalSupply();
  console.log("\n✅ Done. Total fan supply:", total.toString());
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
