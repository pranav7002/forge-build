import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, foundry } from 'wagmi/chains'

export const config = createConfig({
  chains: [foundry],
  transports: {
    [foundry.id]: http(),
  },
})
