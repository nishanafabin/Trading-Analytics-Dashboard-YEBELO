'use client';

import { useState } from 'react';
import TokenSelector from './components/TokenSelector';
import PriceChart from './components/PriceChart';
import RSIChart from './components/RSIChart';
import MetricsDisplay from './components/MetricsDisplay';
import { useTradingData } from './hooks/useTradingData';
import { TokenAddress } from './types';

export default function Dashboard() {
  const [selectedToken, setSelectedToken] = useState<TokenAddress>('token1');
  const { tokenData } = useTradingData();

  const currentTokenData = tokenData[selectedToken];

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Trading Analytics Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Real-time price and RSI monitoring for SOL tokens
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Token Selector */}
        <TokenSelector 
          selectedToken={selectedToken}
          onTokenChange={setSelectedToken}
        />

        {/* Metrics Display */}
        <MetricsDisplay
          currentPrice={currentTokenData.currentPrice}
          currentRSI={currentTokenData.currentRSI}
          tokenAddress={selectedToken}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Chart */}
          <PriceChart
            data={currentTokenData.priceHistory}
            tokenAddress={selectedToken}
          />

          {/* RSI Chart */}
          <RSIChart
            data={currentTokenData.rsiHistory}
            tokenAddress={selectedToken}
          />
        </div>

        {/* Status Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full text-sm bg-gray-800 text-green-400 border border-green-500/30">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse glow-green"></div>
            <span className="font-medium">Live Data Stream Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}