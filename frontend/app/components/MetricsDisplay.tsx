'use client';

interface MetricsDisplayProps {
  currentPrice: number;
  currentRSI: number;
  tokenAddress: string;
}

export default function MetricsDisplay({ currentPrice, currentRSI, tokenAddress }: MetricsDisplayProps) {
  const getRSIColor = (rsi: number) => {
    if (rsi >= 70) return 'text-red-400';
    if (rsi <= 30) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getRSIGlow = (rsi: number) => {
    if (rsi >= 70) return 'glow-red';
    if (rsi <= 30) return 'glow-green';
    return 'glow-gold';
  };

  const getRSIStatus = (rsi: number) => {
    if (rsi >= 70) return 'OVERBOUGHT';
    if (rsi <= 30) return 'OVERSOLD';
    return 'NEUTRAL';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Current Price */}
      <div className="trading-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-wide">
            Current Price
          </h3>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        <div className="text-4xl font-bold text-blue-400 mb-2">
          {currentPrice.toFixed(4)} SOL
        </div>
        <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
          {tokenAddress}
        </div>
      </div>

      {/* Current RSI */}
      <div className={`trading-card p-6 ${getRSIGlow(currentRSI)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-wide">
            RSI Indicator
          </h3>
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            currentRSI >= 70 ? 'bg-red-400' : currentRSI <= 30 ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
        </div>
        <div className={`text-4xl font-bold mb-2 ${getRSIColor(currentRSI)}`}>
          {currentRSI.toFixed(2)}
        </div>
        <div className={`text-sm font-bold uppercase tracking-wider ${getRSIColor(currentRSI)}`}>
          {getRSIStatus(currentRSI)}
        </div>
      </div>
    </div>
  );
}