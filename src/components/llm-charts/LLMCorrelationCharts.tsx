import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LLMData } from '@/types/llm';
import { CorrelationData } from '@/types/llm';

interface LLMCorrelationChartsProps {
  data: LLMData[];
}

export const LLMCorrelationCharts: React.FC<LLMCorrelationChartsProps> = ({ data }) => {
  const correlationData = React.useMemo(() => {
    const models = Array.from(new Set(data.map(d => d.ModelName)));
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    
    return {
      energyVsEWMA: data.map((item, index) => ({
        x: item.EnergyUsage * 100,
        y: item.EWMAScore * 100,
        model: item.ModelName,
        id: index,
        color: colors[models.indexOf(item.ModelName) % colors.length]
      })),
      outputTokenVsEnergy: data.map((item, index) => ({
        x: item.OutputTokenSize,
        y: item.EnergyUsage * 100,
        model: item.ModelName,
        id: index,
        color: colors[models.indexOf(item.ModelName) % colors.length]
      })),
      outputTokenVsEWMA: data.map((item, index) => ({
        x: item.OutputTokenSize,
        y: item.EWMAScore * 100,
        model: item.ModelName,
        id: index,
        color: colors[models.indexOf(item.ModelName) % colors.length]
      })),
      cpuEnergyProduct: data.map((item, index) => ({
        x: item.CPUUsage * 100,
        y: item.EnergyUsage * 100,
        model: item.ModelName,
        id: index,
        color: colors[models.indexOf(item.ModelName) % colors.length]
      }))
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.model}</p>
          <p className="text-sm text-muted-foreground">
            X: {typeof data.x === 'number' ? data.x.toFixed(2) : data.x}
          </p>
          <p className="text-sm text-muted-foreground">
            Y: {typeof data.y === 'number' ? data.y.toFixed(2) : data.y}
          </p>
        </div>
      );
    }
    return null;
  };

  const ScatterPlot = ({ 
    data, 
    title, 
    xLabel, 
    yLabel, 
    xDomain = [0, 100], 
    yDomain = [0, 100] 
  }: { 
    data: CorrelationData[], 
    title: string, 
    xLabel: string, 
    yLabel: string,
    xDomain?: [number, number],
    yDomain?: [number, number]
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number" 
              dataKey="x" 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              domain={xDomain}
              label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              stroke="hsl(var(--foreground))"
              fontSize={12}
              domain={yDomain}
              label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(entry as any).color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ScatterPlot 
        data={correlationData.energyVsEWMA}
        title="Energy Usage vs EWMA Score"
        xLabel="Energy Usage (%)"
        yLabel="EWMA Score (%)"
      />
      <ScatterPlot 
        data={correlationData.outputTokenVsEnergy}
        title="Output Token Size vs Energy Usage"
        xLabel="Output Token Size"
        yLabel="Energy Usage (%)"
        xDomain={[0, Math.max(...data.map(d => d.OutputTokenSize))]}
      />
      <ScatterPlot 
        data={correlationData.outputTokenVsEWMA}
        title="Output Token Size vs EWMA Score"
        xLabel="Output Token Size"
        yLabel="EWMA Score (%)"
        xDomain={[0, Math.max(...data.map(d => d.OutputTokenSize))]}
      />
      <ScatterPlot 
        data={correlationData.cpuEnergyProduct}
        title="CPU Usage × Energy Usage"
        xLabel="CPU Usage (%)"
        yLabel="Energy Usage (%)"
      />
    </div>
  );
};