import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'

// Define Somnia Testnet (formerly Devnet) with verified configuration
export const somniaTestnet = defineChain({
  id: 50312, // 0xc488 in hex
  name: 'Somnia Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Somnia Explorer', 
      url: 'https://somnia-devnet.socialscan.io',
    },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [somniaTestnet],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [somniaTestnet.id]: http('https://dream-rpc.somnia.network', {
      batch: {
        wait: 100,
      },
      retryCount: 5,
      retryDelay: 200,
      timeout: 10000,
    }),
  },
  multiInjectedProviderDiscovery: false,
  ssr: true,
})