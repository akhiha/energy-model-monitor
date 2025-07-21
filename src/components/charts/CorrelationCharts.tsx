import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Energy vs Confidence correlation data
  const energyConfidenceData = React.useMemo(() => {
    const modelColors: Record<string, string> = {};
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    
    data.forEach((item, index) => {
      if (!modelColors[item.ModelName]) {
        modelColors[item.ModelName] = colors[Object.keys(modelColors).length % colors.length];
      }
    });

    return {
      data: data.map(item => ({
        x: item.EnergyUsage,
        y: item.MeanConfidence,
        model: item.ModelName,
        id: item.ID,
        color: modelColors[item.ModelName]
      })),
      modelColors
    };
  }, [data]);

  // Energy vs Inference Time correlation data
  const energyInferenceData = React.useMemo(() => {
    const modelColors: Record<string, string> = {};
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    
    data.forEach((item, index) => {
      if (!modelColors[item.ModelName]) {
        modelColors[item.ModelName] = colors[Object.keys(modelColors).length % colors.length];
      }
    });

    return {
      data: data.map(item => ({
        x: item.EnergyUsage,
        y: item.MeanInference,
        model: item.ModelName,
        id: item.ID,
        color: modelColors[item.ModelName]
      })),
      modelColors
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, xLabel, yLabel }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{data.model}</p>
          <p className="text-sm text-muted-foreground">ID: {data.id}</p>
          <p className="text-sm text-muted-foreground">
            {xLabel}: {data.x.toFixed(3)}
          </p>
          <p className="text-sm text-muted-foreground">
            {yLabel}: {data.y.toFixed(3)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Group data by model for separate scatter series
  const groupDataByModel = (correlationData: any) => {
    const grouped = correlationData.data.reduce((acc: any, point: any) => {
      if (!acc[point.model]) {
        acc[point.model] = [];
      }
      acc[point.model].push(point);
      return acc;
    }, {});

    return Object.entries(grouped).map(([model, points]) => ({
      name: model,
      data: points,
      color: correlationData.modelColors[model]
    }));
  };

  const energyConfidenceGroups = groupDataByModel(energyConfidenceData);
  const energyInferenceGroups = groupDataByModel(energyInferenceData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Energy vs Confidence */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Confidence Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="x" 
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Energy Usage"
                unit="J"
              />
              <YAxis 
                dataKey="y" 
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Confidence"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip content={(props) => 
                <CustomTooltip {...props} xLabel="Energy (J)" yLabel="Confidence" />
              } />
              <Legend />
              {energyConfidenceGroups.map((group) => (
                <Scatter
                  key={group.name}
                  name={group.name}
                  data={group.data as any[]}
                  fill={group.color}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy vs Inference Time */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Inference Time Correlation</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="x" 
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Energy Usage"
                unit="J"
              />
              <YAxis 
                dataKey="y" 
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Inference Time"
                unit="ms"
              />
              <Tooltip content={(props) => 
                <CustomTooltip {...props} xLabel="Energy (J)" yLabel="Inference Time (ms)" />
              } />
              <Legend />
              {energyInferenceGroups.map((group) => (
                <Scatter
                  key={group.name}
                  name={group.name}
                  data={group.data as any[]}
                  fill={group.color}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};