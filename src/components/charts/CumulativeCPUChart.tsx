import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CumulativeCPUChartProps {
  data: MonitoringData[];
}

export const CumulativeCPUChart: React.FC<CumulativeCPUChartProps> = ({ data }) => {
  const cumulativeData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    
    let cumulativeCPU = 0;
    return sortedData.map((item, index) => {
      cumulativeCPU += item.CPUUsage;
      return {
        index: index + 1,
        timestamp: new Date(item.Timestamp).toLocaleTimeString(),
        cumulativeCPU: Number(cumulativeCPU.toFixed(2)),
        model: item.SelectedModel,
      };
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">Time Point: {label}</p>
          <p className="text-sm text-chart-1">
            Cumulative CPU: {payload[0].value}%
          </p>
          <p className="text-sm text-muted-foreground">
            Model: {payload[0].payload.model}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cumulative CPU Usage Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="index" 
              className="text-sm" 
              label={{ value: 'Time Points', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              className="text-sm"
              label={{ value: 'Cumulative CPU (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cumulativeCPU" 
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Cumulative CPU Usage (%)"
              dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};