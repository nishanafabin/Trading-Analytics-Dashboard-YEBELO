'use client';

import { useState, useEffect, useCallback } from 'react';
import { TokenData, TokenAddress, TradeData, RSIData, ChartDataPoint } from '../types';

export function useTradingData() {
  const [tokenData, setTokenData] = useState<Record<TokenAddress, TokenData>>({
    token1: { token_address: 'token1', currentPrice: 0, currentRSI: 50, priceHistory: [], rsiHistory: [] },
    token2: { token_address: 'token2', currentPrice: 0, currentRSI: 50, priceHistory: [], rsiHistory: [] },
    token3: { token_address: 'token3', currentPrice: 0, currentRSI: 50, priceHistory: [], rsiHistory: [] },
    token4: { token_address: 'token4', currentPrice: 0, currentRSI: 50, priceHistory: [], rsiHistory: [] },
    token5: { token_address: 'token5', currentPrice: 0, currentRSI: 50, priceHistory: [], rsiHistory: [] },
  });

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const updateTradeData = useCallback((trade: TradeData) => {
    const tokenAddress = trade.token_address as TokenAddress;
    if (!tokenAddress) return;

    setTokenData(prev => {
      const current = prev[tokenAddress];
      const timestamp = trade.timestamp || Date.now();
      
      const newPricePoint: ChartDataPoint = {
        timestamp,
        price: trade.price_in_sol,
        time: formatTime(timestamp)
      };

      const updatedPriceHistory = [...current.priceHistory, newPricePoint].slice(-50);

      return {
        ...prev,
        [tokenAddress]: {
          ...current,
          currentPrice: trade.price_in_sol,
          priceHistory: updatedPriceHistory
        }
      };
    });
  }, []);

  const updateRSIData = useCallback((rsi: RSIData) => {
    const tokenAddress = rsi.token_address as TokenAddress;
    if (!tokenAddress) return;

    setTokenData(prev => {
      const current = prev[tokenAddress];
      
      const newRSIPoint: ChartDataPoint = {
        timestamp: rsi.timestamp,
        rsi: rsi.rsi,
        time: formatTime(rsi.timestamp)
      };

      const updatedRSIHistory = [...current.rsiHistory, newRSIPoint].slice(-50);

      return {
        ...prev,
        [tokenAddress]: {
          ...current,
          currentRSI: rsi.rsi,
          rsiHistory: updatedRSIHistory
        }
      };
    });
  }, []);

  // Fast mock data generation for immediate results
  const generateLiveData = useCallback(() => {
    const now = Date.now();
    const tokens = ['token1', 'token2', 'token3', 'token4', 'token5'];
    const basePrices = [1.2, 2.3, 0.95, 3.1, 5.2];
    
    tokens.forEach((token, index) => {
      const basePrice = basePrices[index];
      const priceVariation = (Math.random() - 0.5) * 0.1;
      const price = basePrice + priceVariation;
      
      // Generate trade data
      const trade: TradeData = {
        token_address: token,
        price_in_sol: Number(price.toFixed(4)),
        timestamp: now + index * 100
      };
      
      updateTradeData(trade);
      
      // Generate RSI data with realistic values
      const rsiBase = [45, 68, 35, 52, 41][index];
      const rsiVariation = (Math.random() - 0.5) * 10;
      const rsi = Math.max(10, Math.min(90, rsiBase + rsiVariation));
      
      const rsiData: RSIData = {
        token_address: token,
        rsi: Number(rsi.toFixed(2)),
        timestamp: now + index * 100
      };
      
      updateRSIData(rsiData);
    });
  }, [updateTradeData, updateRSIData]);

  useEffect(() => {
    // Generate initial data immediately
    generateLiveData();
    
    // Update every 2 seconds for live feel
    const interval = setInterval(generateLiveData, 2000);
    
    return () => clearInterval(interval);
  }, [generateLiveData]);

  return {
    tokenData,
    updateTradeData,
    updateRSIData
  };
}