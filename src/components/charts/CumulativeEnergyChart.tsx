import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CumulativeEnergyChartProps {
  data: MonitoringData[];
}

export const CumulativeEnergyChart: React.FC<CumulativeEnergyChartProps> = ({ data }) => {
  const cumulativeData = React.useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.ID - b.ID);
    let cumulativeEnergy = 0;

    return sortedData.map(item => {
      cumulativeEnergy += item.EnergyUsage;
      return {
        ID: item.ID,
        CumulativeEnergy: cumulativeEnergy,
        EnergyUsage: item.EnergyUsage,
        ModelName: item.ModelName
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">ID: {label}</p>
          <p className="text-sm text-chart-2">
            Cumulative Energy: {data.CumulativeEnergy.toFixed(2)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Current Usage: {data.EnergyUsage.toFixed(2)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Model: {data.ModelName}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="chart-container">
      <CardHeader>
        <CardTitle>Cumulative Energy Consumption Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="ID" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(0)}J`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="CumulativeEnergy"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              name="Cumulative Energy (J)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};