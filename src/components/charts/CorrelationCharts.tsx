import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Get unique models and prepare data for each model
  const models = [...new Set(data.map(item => item.ModelName))].slice(0, 4); // Take first 4 models
  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
  
  // State for model selection
  const [selectedModels, setSelectedModels] = useState<string[]>(models);

  const modelChartData = models.map((model, index) => {
    const modelData = data.filter(item => item.ModelName === model);
    
    // Confidence data
    const confidenceData = modelData.map(item => ({
      x: item.EnergyUsage,
      y: item.MeanConfidence,
      id: item.ID
    }));
    
    // Inference data
    const inferenceData = modelData.map(item => ({
      x: item.EnergyUsage,
      y: item.MeanInference,
      id: item.ID
    }));
    
    return {
      model,
      confidenceData,
      inferenceData,
      color: colors[index]
    };
  });

  // Filter data based on selected models
  const filteredChartData = modelChartData.filter(chart => selectedModels.includes(chart.model));

  const toggleModel = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  const CustomTooltipConfidence = ({ active, payload }: any) => {
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

  const CustomTooltipInference = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="text-sm text-muted-foreground">ID: {data.id}</p>
          <p className="text-sm text-muted-foreground">
            Energy: {data.x.toFixed(3)}J
          </p>
          <p className="text-sm text-muted-foreground">
            Inference: {data.y.toFixed(2)}ms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Model Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {models.map((model, index) => (
              <Button
                key={model}
                variant={selectedModels.includes(model) ? "default" : "outline"}
                onClick={() => toggleModel(model)}
                className="text-sm"
                style={selectedModels.includes(model) ? { backgroundColor: colors[index] } : {}}
              >
                {model}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy vs Confidence Chart */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Confidence Correlation</CardTitle>
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
              <Tooltip content={CustomTooltipConfidence} />
              
              {/* Scatter plot for each selected model */}
              {filteredChartData.map((modelChart) => (
                <Scatter
                  key={modelChart.model}
                  name={modelChart.model}
                  data={modelChart.confidenceData}
                  fill={modelChart.color}
                  strokeWidth={0}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy vs Inference Time Chart */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Inference Time Correlation</CardTitle>
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
                domain={[0, 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                name="Inference Time"
                unit="ms"
                tickCount={6}
              />
              <Tooltip content={CustomTooltipInference} />
              
              {/* Scatter plot for each selected model */}
              {filteredChartData.map((modelChart) => (
                <Scatter
                  key={modelChart.model}
                  name={modelChart.model}
                  data={modelChart.inferenceData}
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