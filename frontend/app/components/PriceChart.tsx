'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface PriceChartProps {
  data: ChartDataPoint[];
  tokenAddress: string;
}

export default function PriceChart({ data, tokenAddress }: PriceChartProps) {
  return (
    <div className="chart-container p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide">
          {tokenAddress} Price Chart
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span className="text-sm text-gray-400 font-medium">PRICE</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="1 1" stroke="#2d2d2d" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={11}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={11}
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            labelFormatter={(value) => `Time: ${value}`}
            formatter={(value: number) => [`${value.toFixed(4)} SOL`, 'Price']}
            contentStyle={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #2d2d2d',
              borderRadius: '8px',
              color: '#e5e7eb',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#4FC3F7" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#4FC3F7', strokeWidth: 2, stroke: '#1c1c1c' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}