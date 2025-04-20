# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

Useful commands:
```
npx hardhat run scripts/deploy.js --network localhost
CONTRACT=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6 npx hardhat run scripts/revenueFlowDemo.js --network localhost
```