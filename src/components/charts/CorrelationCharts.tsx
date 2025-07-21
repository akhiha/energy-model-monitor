import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Energy vs Confidence scatter with model colors
  const energyConfidenceData = React.useMemo(() => {
    const modelColors: Record<string, string> = {
      'EfficientliteV2': 'hsl(var(--chart-1))',
      'EfficientNetB0': 'hsl(var(--chart-2))',
      'MobileNetV3': 'hsl(var(--chart-3))',
      'ResNet50': 'hsl(var(--chart-4))'
    };

    return data.map(item => ({
      energy: item.EnergyUsage,
      confidence: item.MeanConfidence * 100,
      model: item.ModelName,
      id: item.ID,
      color: modelColors[item.ModelName] || 'hsl(var(--chart-1))'
    }));
  }, [data]);

  // Energy vs CPU Usage scatter
  const energyCPUData = React.useMemo(() => {
    const modelColors: Record<string, string> = {
      'EfficientliteV2': 'hsl(var(--chart-1))',
      'EfficientNetB0': 'hsl(var(--chart-2))',
      'MobileNetV3': 'hsl(var(--chart-3))',
      'ResNet50': 'hsl(var(--chart-4))'
    };

    return data.map(item => ({
      energy: item.EnergyUsage,
      cpu: item.CPUUsage,
      model: item.ModelName,
      id: item.ID,
      color: modelColors[item.ModelName] || 'hsl(var(--chart-1))'
    }));
  }, [data]);

  // Group data by model for separate scatter series
  const groupByModel = (scatterData: any[], xKey: string, yKey: string) => {
    const grouped = scatterData.reduce((acc, point) => {
      if (!acc[point.model]) {
        acc[point.model] = [];
      }
      acc[point.model].push({
        [xKey]: point[xKey === 'energy' ? 'energy' : yKey === 'confidence' ? 'confidence' : 'cpu'],
        [yKey]: point[xKey === 'energy' ? 'energy' : yKey === 'confidence' ? 'confidence' : 'cpu'],
        model: point.model,
        id: point.id
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([model, points], index) => ({
      name: model,
      data: points,
      color: `hsl(var(--chart-${index + 1}))`
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">Model: {data.model}</p>
          <p className="text-sm text-muted-foreground">ID: {data.id}</p>
          <p className="text-sm text-muted-foreground">
            Energy: {data.energy?.toFixed(2)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Confidence: {data.confidence?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CPUTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">Model: {data.model}</p>
          <p className="text-sm text-muted-foreground">ID: {data.id}</p>
          <p className="text-sm text-muted-foreground">
            Energy: {data.energy?.toFixed(2)}J
          </p>
          <p className="text-sm text-muted-foreground">
            CPU Usage: {data.cpu?.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Energy vs Confidence Correlation */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Confidence Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={energyConfidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="energy"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Energy Usage (J)"
                tickFormatter={(value) => `${value.toFixed(1)}J`}
              />
              <YAxis 
                dataKey="confidence"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Confidence (%)"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {['EfficientliteV2', 'EfficientNetB0', 'MobileNetV3', 'ResNet50'].map((model, index) => (
                <Scatter
                  key={model}
                  name={model}
                  data={energyConfidenceData.filter(d => d.model === model)}
                  fill={`hsl(var(--chart-${index + 1}))`}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy vs CPU Usage Correlation */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs CPU Usage Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={energyCPUData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="energy"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Energy Usage (J)"
                tickFormatter={(value) => `${value.toFixed(1)}J`}
              />
              <YAxis 
                dataKey="cpu"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="CPU Usage (%)"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
              />
              <Tooltip content={<CPUTooltip />} />
              <Legend />
              {['EfficientliteV2', 'EfficientNetB0', 'MobileNetV3', 'ResNet50'].map((model, index) => (
                <Scatter
                  key={model}
                  name={model}
                  data={energyCPUData.filter(d => d.model === model)}
                  fill={`hsl(var(--chart-${index + 1}))`}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};