// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Grab three of the default accounts the Hardhat node exposes
  const [deployer, payee1, payee2] = await hre.ethers.getSigners();

  const payees  = [payee1.address, payee2.address];  // already checksummed
  const weights = [70, 30];
  const fanBps  = 3000;

  const Royalty = await hre.ethers.getContractFactory("RoyaltySplitterDemo");
  const royalty = await Royalty.deploy(payees, weights, fanBps);
  await royalty.waitForDeployment();

  console.log("RoyaltySplitterDemo deployed to:", await royalty.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
