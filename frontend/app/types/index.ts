export interface TradeData {
  token_address: string;
  price_in_sol: number;
  timestamp: number;
}

export interface RSIData {
  token_address: string;
  rsi: number;
  timestamp: number;
}

export interface ChartDataPoint {
  timestamp: number;
  price?: number;
  rsi?: number;
  time: string;
}

export interface TokenData {
  token_address: string;
  currentPrice: number;
  currentRSI: number;
  priceHistory: ChartDataPoint[];
  rsiHistory: ChartDataPoint[];
}

export const TOKENS = [
  'token1',
  'token2', 
  'token3',
  'token4',
  'token5'
] as const;

export type TokenAddress = typeof TOKENS[number];