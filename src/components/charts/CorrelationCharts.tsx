import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Energy vs Confidence with quartiles
  const energyConfidenceQuartileData = React.useMemo(() => {
    // Calculate quartiles for confidence
    const confidenceValues = data.map(item => item.MeanConfidence).sort((a, b) => a - b);
    const q1 = confidenceValues[Math.floor(confidenceValues.length * 0.25)];
    const q2 = confidenceValues[Math.floor(confidenceValues.length * 0.5)];
    const q3 = confidenceValues[Math.floor(confidenceValues.length * 0.75)];

    const getQuartileLabel = (confidence: number) => {
      if (confidence <= q1) return 'Q1: Low (0-25%)';
      if (confidence <= q2) return 'Q2: Medium-Low (25-50%)';
      if (confidence <= q3) return 'Q3: Medium-High (50-75%)';
      return 'Q4: High (75-100%)';
    };

    const modelColors: Record<string, string> = {};
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
    
    data.forEach((item) => {
      if (!modelColors[item.ModelName]) {
        modelColors[item.ModelName] = colors[Object.keys(modelColors).length % colors.length];
      }
    });

    // Group by quartile and model
    const quartileData = data.reduce((acc, item) => {
      const quartile = getQuartileLabel(item.MeanConfidence);
      const model = item.ModelName;
      const key = `${quartile}-${model}`;
      
      if (!acc[key]) {
        acc[key] = {
          quartile,
          model,
          energySum: 0,
          count: 0,
          color: modelColors[model]
        };
      }
      
      acc[key].energySum += item.EnergyUsage;
      acc[key].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(quartileData).map((item: any) => ({
      quartile: item.quartile,
      model: item.model,
      avgEnergy: item.energySum / item.count,
      count: item.count,
      color: item.color
    }));
  }, [data]);

  // Model Performance Overview
  const modelPerformanceData = React.useMemo(() => {
    const modelStats = data.reduce((acc, item) => {
      if (!acc[item.ModelName]) {
        acc[item.ModelName] = {
          totalEnergy: 0,
          totalConfidence: 0,
          totalCPU: 0,
          count: 0
        };
      }
      
      acc[item.ModelName].totalEnergy += item.EnergyUsage;
      acc[item.ModelName].totalConfidence += item.MeanConfidence;
      acc[item.ModelName].totalCPU += item.CPUUsage || 0;
      acc[item.ModelName].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(modelStats).map(([model, stats]) => ({
      model,
      avgEnergy: stats.totalEnergy / stats.count,
      avgConfidence: (stats.totalConfidence / stats.count) * 100,
      avgCPU: stats.totalCPU / stats.count,
      efficiency: ((stats.totalConfidence / stats.count) * 100) / (stats.totalEnergy / stats.count),
      count: stats.count
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.quartile}</p>
          <p className="text-sm text-chart-3">Model: {data.model}</p>
          <p className="text-sm text-muted-foreground">
            Avg Energy: {data.avgEnergy.toFixed(2)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Sample Count: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  const PerformanceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.model}</p>
          <p className="text-sm text-muted-foreground">
            Avg Energy: {data.avgEnergy.toFixed(2)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Avg Confidence: {data.avgConfidence.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground">
            Avg CPU: {data.avgCPU.toFixed(1)}%
          </p>
          <p className="text-sm text-chart-4 font-medium">
            Efficiency: {data.efficiency.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Energy by Confidence Quartiles */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy Usage by Confidence Quartiles</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energyConfidenceQuartileData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="quartile"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value.toFixed(1)}J`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {['EfficientliteV2', 'MobilenetV2', 'ResNet50', 'DenseNet121'].map((model, index) => (
                <Bar
                  key={model}
                  dataKey="avgEnergy"
                  data={energyConfidenceQuartileData.filter(d => d.model === model)}
                  fill={`hsl(var(--chart-${index + 1}))`}
                  name={model}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Performance Overview */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Model Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={modelPerformanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis 
                type="category"
                dataKey="model"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                width={100}
              />
              <Tooltip content={<PerformanceTooltip />} />
              <Legend />
              <Bar
                dataKey="efficiency"
                fill="hsl(var(--chart-4))"
                name="Efficiency Score"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};