import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData, ChartData } from '@/types/dashboard';

interface ModelFrequencyChartProps {
  data: MonitoringData[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export const ModelFrequencyChart: React.FC<ModelFrequencyChartProps> = ({ data }) => {
  const frequencyData: ChartData[] = React.useMemo(() => {
    const counts = data.reduce((acc, item) => {
      acc[item.ModelName] = (acc[item.ModelName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / data.payload.total) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-muted-foreground">
            Count: {data.value} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Add total to each data point for percentage calculation
  const total = frequencyData.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = frequencyData.map(item => ({ ...item, total }));

  return (
    <Card className="chart-container">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Model Selection Frequency</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {frequencyData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};