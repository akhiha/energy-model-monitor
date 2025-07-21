import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LLMData } from '@/types/llm';

interface LLMModelFrequencyChartProps {
  data: LLMData[];
}

export const LLMModelFrequencyChart: React.FC<LLMModelFrequencyChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    const frequency = data.reduce((acc, item) => {
      acc[item.ModelName] = (acc[item.ModelName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequency)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / data.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Selection Frequency</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              label={{ value: 'Model Name', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value, name) => [
                `${value} times (${chartData.find(d => d.count === value)?.percentage}%)`,
                'Frequency'
              ]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};