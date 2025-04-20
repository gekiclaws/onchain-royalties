# 🎵 Royalty Splitter Demo

This project is a **self-contained smart contract demo** for splitting ETH-based music royalties between core **stakeholders** (e.g. artists, collaborators, labels) and a **fan pool**. Fan token holders can claim a proportional share of the revenue reserved for them.

The system is designed to simulate real-world royalty flows and reward supporters transparently on-chain.

---

## ⚙️ Features

- 🔁 **Royalty Splitting**: ETH sent to the contract is distributed between payees and a fan pool.
- 🎫 **Fan Rewards**: Supporters receive mock "fan tokens" that entitle them to claim ETH from the pool.
- ⚖️ **Custom Weights**: Payees can have any arbitrary split (e.g. 80% / 20%).
- 📜 **Full Transparency**: Payees and shares are public and logged on deployment.
- 🧪 **No External Dependencies**: No Chainlink, OpenZeppelin, or ERC-20s required.

---

## 🚀 Quickstart

### 🧱 Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- Git + VS Code (recommended)
- A terminal (any platform)

---

### 📥 Clone the Repo

```bash
git clone https://github.com/gekiclaws/onchain-royalties.git
cd onchain-royalties
```

---

### 📦 Install Dependencies

```bash
npm install
```

---

### 🧪 Run the Full Demo Locally

This project uses [Hardhat](https://hardhat.org/) and the local Hardhat testnet.

#### Step 1: Start the testnet

In **Terminal A**:

```bash
npx hardhat node
```

This will launch a local blockchain with 20 pre-funded accounts.

---

#### Step 2: Deploy the contract

In **Terminal B**:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will deploy `RoyaltySplitterDemo` with:
- Two payees: artist1 and artist2
- Weights: 80 / 20
- Fan pool share: 2% (i.e. `fanShareBPS = 200`)

Copy the deployed contract address shown in the terminal.

---

#### Step 3: Run the revenue flow demo

On MacOS:
```bash
# Replace <ADDRESS> with the actual deployed contract address
# Example: CONTRACT=0x5FbDB2315678afecb367f032d93F642f64180aa3 npx hardhat run scripts/revenueFlowDemo.js --network localhost
CONTRACT=<ADDRESS> npx hardhat run scripts/revenueFlowDemo.js --network localhost
```

On Windows:
```bash
# Replace <ADDRESS> with the actual deployed contract address
# Example: $env:CONTRACT="0x5fbdb2315678afecb367f032d93f642f64180aa3"
$env:CONTRACT=<ADDRESS>
npx hardhat run scripts/revenueFlowDemo.js --network localhost
```

This script will:

1. Mint fan tokens
2. Fund the contract with 5 ETH
3. Call `distribute()` to send ETH to payees and reserve the portion for fans
4. Log the contract's internal state, and the balances of payees/fans
5. Let fans claim their share and show how much each received

---

## 🧠 Modifying the Flow

You can customize the system by editing these two files:

### 🔧 `scripts/deploy.js`
- Change the number of **payees**
- Modify the **weight** (split) of each stakeholder
- Adjust the **fanShareBPS** (e.g. `100` = 1%, `3000` = 30%)

### 🔧 `scripts/revenueFlowDemo.js`
- Change which accounts receive **fan tokens**
- Alter the number of tokens minted
- Adjust how much **ETH** is sent to the contract
- Simulate multiple claim rounds

This flexibility lets you simulate real-world launch scenarios, including pre-funding fan token ownership before a song or album generates revenue.

---

## 📂 Project Structure

```bash
├── contracts/
│   └── RoyaltySplitterDemo.sol       # Main smart contract
├── scripts/
│   ├── deploy.js                     # Deploys the contract
│   └── revenueFlowDemo.js            # Full royalty split simulation
├── hardhat.config.js                 # Hardhat configuration
├── package.json
└── README.md                         # You’re here
```

---

## 🌍 Real-World Considerations
This project is a minimal prototype intended for demo purposes. In a production system, you may want to:

- Replace the mock fan token logic with actual ERC-20s or NFTs
- Enforce a cap on total fan token supply to prevent dilution
- Snapshot fan token balances at the time of distribution to ensure fairness
- Implement access control (e.g. Ownable) to manage minting and admin actions
- Integrate with real-world revenue sources (e.g. automatically receive ETH when Spotify reports and pays out for streams)
- Add UI dashboards or analytics to track payouts and claims
- Perform formal security audits before handling real funds