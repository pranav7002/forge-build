# Portfolio Website

My personal portfolio site with a simple dApp demo. The front-end connects to a SimpleStorage smart contract on Sepolia testnet.

## What's Here

- **Portfolio section**: Basic intro and links
- **Simple Storage dApp**: Connect your MetaMask wallet and interact with a smart contract that stores a number on-chain

### Front-end

1. Open `front-end/index.html` in a browser (or use a local server)
2. Make sure you have MetaMask installed
3. Connect your wallet and try the Simple Storage demo

The front-end uses viem via CDN, so you'll need an internet connection.

### Smart Contracts

The contracts are in the `smart-contacts` folder. Built with Foundry.

```bash
cd smart-contacts
forge build
forge test
```

The SimpleStorage contract is deployed at `0xE4d81B02e63E02871D6ef211786bD7A11130A2b3` on Sepolia.

## Tech Stack

- Vanilla JavaScript + HTML/CSS for the front-end
- viem for Ethereum interactions
- Foundry for smart contract development
- Solidity ^0.8.0

