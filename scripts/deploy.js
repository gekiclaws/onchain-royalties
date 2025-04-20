// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Grab three of the default accounts the Hardhat node exposes
  const [deployer, artist1, artist2] = await hre.ethers.getSigners();

  const payees  = [artist1.address, artist2.address];  // already checksummed
  const weights = [80, 20]; // 80% to main artist, 20% to collaborator
  const fanBps  = 200; // Fans get 2% of the royalties

  const Royalty = await hre.ethers.getContractFactory("RoyaltySplitterDemo");
  const royalty = await Royalty.deploy(
    artist1.address,   // main artist owns the contract
    payees,
    weights,
    fanBps
  );
  await royalty.waitForDeployment();

  console.log("RoyaltySplitterDemo deployed to:", await royalty.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
