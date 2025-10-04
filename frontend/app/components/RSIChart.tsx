'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartDataPoint } from '../types';

interface RSIChartProps {
  data: ChartDataPoint[];
  tokenAddress: string;
}

export default function RSIChart({ data, tokenAddress }: RSIChartProps) {
  return (
    <div className="chart-container p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white uppercase tracking-wide">
          {tokenAddress} RSI Chart
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">70</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">RSI</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-400 font-medium">30</span>
          </div>
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
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            labelFormatter={(value) => `Time: ${value}`}
            formatter={(value: number) => [value.toFixed(2), 'RSI']}
            contentStyle={{
              backgroundColor: '#1c1c1c',
              border: '1px solid #2d2d2d',
              borderRadius: '8px',
              color: '#e5e7eb',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
          />
          
          {/* Overbought line at 70 */}
          <ReferenceLine 
            y={70} 
            stroke="#FF4C4C" 
            strokeDasharray="2 2" 
            strokeWidth={2}
            label={{ 
              value: "OVERBOUGHT", 
              position: "topLeft",
              style: { fill: '#FF4C4C', fontSize: '12px', fontWeight: 'bold' }
            }}
          />
          
          {/* Oversold line at 30 */}
          <ReferenceLine 
            y={30} 
            stroke="#00FF7F" 
            strokeDasharray="2 2" 
            strokeWidth={2}
            label={{ 
              value: "OVERSOLD", 
              position: "bottomLeft",
              style: { fill: '#00FF7F', fontSize: '12px', fontWeight: 'bold' }
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="rsi" 
            stroke="#FFD700" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#FFD700', strokeWidth: 2, stroke: '#1c1c1c' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}