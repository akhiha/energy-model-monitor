import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Get unique models and prepare data for each model
  const models = [...new Set(data.map(item => item.ModelName))].slice(0, 4); // Take first 4 models
  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  // Calculate trend line for each model
  const calculateTrendLine = (modelData: MonitoringData[]) => {
    const n = modelData.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    const xValues = modelData.map(item => item.EnergyUsage);
    const yValues = modelData.map(item => item.MeanConfidence);
    
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
      denominator += (xValues[i] - xMean) * (xValues[i] - xMean);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    
    return { slope, intercept };
  };

  const modelChartData = models.map((model, index) => {
    const modelData = data.filter(item => item.ModelName === model);
    const scatterData = modelData.map(item => ({
      x: item.EnergyUsage,
      y: item.MeanConfidence,
      id: item.ID
    }));
    
    const { slope, intercept } = calculateTrendLine(modelData);
    
    // Create trend line points
    const xMin = Math.min(...scatterData.map(d => d.x));
    const xMax = Math.max(...scatterData.map(d => d.x));
    const trendLine = [
      { x: xMin, y: slope * xMin + intercept },
      { x: xMax, y: slope * xMax + intercept }
    ];
    
    return {
      model,
      data: scatterData,
      trendLine,
      color: colors[index],
      correlation: slope // Simple correlation indicator
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="text-sm text-muted-foreground">ID: {data.id}</p>
          <p className="text-sm text-muted-foreground">
            Energy: {data.x.toFixed(3)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Confidence: {(data.y * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Confidence Correlation - All Models</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                dataKey="x" 
                domain={[0, 5]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Energy Usage"
                unit="J"
                tickCount={6}
              />
              <YAxis 
                type="number"
                dataKey="y" 
                domain={[0, 1]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Confidence"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tickCount={6}
              />
              <Tooltip content={CustomTooltip} />
              
              {/* Scatter plot for each model */}
              {modelChartData.map((modelChart) => (
                <Scatter
                  key={modelChart.model}
                  name={modelChart.model}
                  data={modelChart.data}
                  fill={modelChart.color}
                  strokeWidth={0}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};