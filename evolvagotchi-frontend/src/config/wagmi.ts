import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

// Define Somnia Devnet
export const somniaDevnet = defineChain({
  id: 50312,
  name: 'Somnia Devnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: { name: 'SomniaScan', url: 'https://somniascan.io' },
  },
})

export const config = createConfig({
  chains: [somniaDevnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [somniaDevnet.id]: http('https://dream-rpc.somnia.network/'),
  },
  multiInjectedProviderDiscovery: false,
})