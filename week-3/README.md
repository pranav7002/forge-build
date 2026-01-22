# Simple AMM

A minimal AMM implementation for the hackathon, using gas-efficient custom errors.

Swaps ETH <> USDC.

## Contracts
- `USDCPool.sol`: Single file AMM logic with custom errors for gas optimization.
- `USDCToken.sol`: Mock USDC for testing.

## Functions
- `swapEthToUsdc(minOut)`
- `swapUsdcToEth(amountIn, minOut)`
- `addLiquidity(tokenAmount)`
- `removeLiquidity(amount)`

## Setup
```shell
forge build
forge test
```

## Frontend
The frontend is built with Next.js, Wagmi, and Viem.

1. Navigate to frontend:
   ```shell
   cd frontend
   ```
2. Install dependencies:
   ```shell
   npm install
   ```
3. Run dev server:
   ```shell
   npm run dev
   ```
4. Update `src/constants.ts` with your deployed contract addresses.
