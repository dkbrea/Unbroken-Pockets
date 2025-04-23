import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TimeRange, PerformanceData } from '../hooks/useInvestmentsData';

// Sample historical data for different time ranges
const generateHistoricalData = (timeRange: TimeRange, currentValue: number, performanceData: PerformanceData) => {
  const data = [];
  const periods = {
    '1D': 24, // Hours
    '1W': 7,  // Days
    '1M': 30, // Days
    '1Y': 12, // Months
    'All': 5  // Years
  };
  
  const periodCount = periods[timeRange];
  const startValue = currentValue - performanceData.amount;
  
  // Format labels based on time range
  const getLabel = (index: number, totalPoints: number) => {
    switch (timeRange) {
      case '1D':
        return `${index}:00`;
      case '1W':
        return `Day ${index + 1}`;
      case '1M':
        return `Week ${Math.ceil((index + 1) / 7)}`;
      case '1Y':
        return `Month ${index + 1}`;
      case 'All':
        return `Year ${new Date().getFullYear() - (totalPoints - index - 1)}`;
    }
  };
  
  // Generate data points with some randomness to simulate real market fluctuations
  for (let i = 0; i < periodCount; i++) {
    const progress = i / (periodCount - 1);
    const randomFactor = Math.random() * 0.1 - 0.05; // -5% to +5% random noise
    const value = startValue + (performanceData.amount * progress) * (1 + randomFactor);
    
    data.push({
      name: getLabel(i, periodCount),
      value: parseFloat(value.toFixed(2))
    });
  }
  
  // Ensure the last point matches exactly
  if (data.length > 0) {
    data[data.length - 1].value = currentValue;
  }
  
  return data;
};

interface InvestmentPerformanceChartProps {
  timeRange: TimeRange;
  currentValue: number;
  performanceData: PerformanceData;
  hideBalances?: boolean;
}

const InvestmentPerformanceChart: React.FC<InvestmentPerformanceChartProps> = ({
  timeRange,
  currentValue,
  performanceData,
  hideBalances = false
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    setChartData(generateHistoricalData(timeRange, currentValue, performanceData));
  }, [timeRange, currentValue, performanceData]);

  const formatYAxis = (value: number) => {
    if (hideBalances) return '***';
    return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
  };
  
  const formatTooltip = (value: number) => {
    if (hideBalances) return '***';
    return value >= 1000 
      ? `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}` 
      : `$${value.toFixed(2)}`;
  };
  
  // Determine line color based on performance
  const lineColor = performanceData.amount >= 0 ? '#10b981' : '#ef4444';

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
          />
          <YAxis 
            tickFormatter={formatYAxis} 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip 
            formatter={(value: number) => formatTooltip(value)}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentPerformanceChart; 