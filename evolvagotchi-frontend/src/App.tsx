import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi'
import { EvolvagotchiGame } from './components/EvolvagotchiGame'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <EvolvagotchiGame />
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App