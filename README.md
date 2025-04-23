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

This deploys `RoyaltySplitterDemo` with:
- Two payees: artist1 and artist2  
- Weights: 80 / 20  
- Fan pool share: 2% (`fanShareBPS = 200`)  

Copy the deployed contract address shown in the terminal.

---

#### Step 3: Mint fan tokens

Run **once** (or whenever you need new fans):

```bash
# MacOS & Linux
CONTRACT=<ADDRESS> npx hardhat run scripts/mintFans.js --network localhost

# Windows PowerShell
$env:CONTRACT="<ADDRESS>"
npx hardhat run scripts/mintFans.js --network localhost
```

This will:
1. Connect as the designated owner  
2. Mint mock fan tokens to the configured accounts  
3. Log the new total fan supply  

---

#### Step 4: Run the revenue flow demo

With fans already minted:

```bash
# MacOS & Linux
CONTRACT=<ADDRESS> npx hardhat run scripts/revenueFlowDemo.js --network localhost

# Windows PowerShell
$env:CONTRACT="<ADDRESS>"
npx hardhat run scripts/revenueFlowDemo.js --network localhost
```

This script will:

1. Fund the contract with 5 ETH  
2. Call `distribute()` to send ETH to payees and reserve the portion for fans  
3. Log the contract’s state and balances of payees  
4. Let fans claim their share and show how much each received  

---

## 🧠 Modifying the Flow

You can customize the system by editing these files:

### 🔧 `scripts/deploy.js`
- Change the number of **payees**  
- Modify each stakeholder’s **weight** (split)  
- Adjust the **fanShareBPS** (e.g. `100` = 1%, `3000` = 30%)  

### 🔧 `scripts/mintFans.js`
- Update which accounts receive **fan tokens**  
- Alter the **amount** minted per account  

### 🔧 `scripts/revenueFlowDemo.js`
- Change how much **ETH** is sent to the contract  
- Simulate multiple distribution/claim rounds  

This flexibility lets you simulate real-world launch scenarios: mint fans first, then generate and split revenue.

---

## 📂 Project Structure

```bash
├── contracts/
│   └── RoyaltySplitterDemo.sol       # Main smart contract
├── scripts/
│   ├── deploy.js                     # Deploys the contract
│   ├── mintFans.js                   # Mint fan tokens (one-off or top-up)
│   └── revenueFlowDemo.js            # Fund → distribute → fan claim flow
├── hardhat.config.js                 # Hardhat configuration
├── package.json
└── README.md                         # You’re here
```

---

## 🌍 Real-World Considerations

This project is a minimal prototype intended for demo purposes. In a production system, you may want to:

- Replace mock fan-token logic with actual ERC-20s or NFTs  
- Enforce a cap on total fan token supply to prevent dilution  
- Snapshot fan token balances at distribution time to ensure fairness  
- Implement access control (e.g. Ownable) for minting/admin actions  
- Integrate real-world revenue sources (e.g. automated ETH receipts from Spotify)  
- Add UI dashboards or analytics to track payouts and claims  
- Perform formal security audits before handling real funds  