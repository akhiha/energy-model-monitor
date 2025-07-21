import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LLMData } from '@/types/llm';

interface LLMCumulativeEnergyChartProps {
  data: LLMData[];
}

export const LLMCumulativeEnergyChart: React.FC<LLMCumulativeEnergyChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const sortedData = [...data].sort((a, b) => 
      new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
    );

    let cumulativeEnergy = 0;
    return sortedData.map((item) => {
      cumulativeEnergy += item.EnergyUsage;
      return {
        timestamp: new Date(parseInt(item.Timestamp)).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        cumulativeEnergy: cumulativeEnergy,
        energyUsage: item.EnergyUsage,
        model: item.ModelName
      };
    });
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Energy Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="timestamp" 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              label={{ value: 'Cumulative Energy Usage', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value: any, name: string) => [
                `${(value as number).toFixed(3)}`,
                name === 'cumulativeEnergy' ? 'Cumulative Energy' : name
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeEnergy" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};