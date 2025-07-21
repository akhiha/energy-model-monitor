import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Prepare box plot data for Energy vs Confidence
  const energyConfidenceBoxData = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.ModelName))];
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    
    return models.map((model, index) => {
      const modelData = data.filter(item => item.ModelName === model);
      const confidenceValues = modelData.map(item => item.MeanConfidence).sort((a, b) => a - b);
      const energyValues = modelData.map(item => item.EnergyUsage).sort((a, b) => a - b);
      
      // Calculate quartiles for confidence
      const confidenceQ1 = confidenceValues[Math.floor(confidenceValues.length * 0.25)];
      const confidenceQ2 = confidenceValues[Math.floor(confidenceValues.length * 0.5)];
      const confidenceQ3 = confidenceValues[Math.floor(confidenceValues.length * 0.75)];
      
      // Calculate quartiles for energy
      const energyQ1 = energyValues[Math.floor(energyValues.length * 0.25)];
      const energyQ2 = energyValues[Math.floor(energyValues.length * 0.5)];
      const energyQ3 = energyValues[Math.floor(energyValues.length * 0.75)];
      
      return {
        model,
        confidenceMin: confidenceValues[0],
        confidenceQ1,
        confidenceQ2,
        confidenceQ3,
        confidenceMax: confidenceValues[confidenceValues.length - 1],
        energyMin: energyValues[0],
        energyQ1,
        energyQ2,
        energyQ3,
        energyMax: energyValues[energyValues.length - 1],
        color: colors[index % colors.length]
      };
    });
  }, [data]);

  // Prepare box plot data for Energy vs Inference Time
  const energyInferenceBoxData = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.ModelName))];
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    
    return models.map((model, index) => {
      const modelData = data.filter(item => item.ModelName === model);
      const inferenceValues = modelData.map(item => item.MeanInference).sort((a, b) => a - b);
      const energyValues = modelData.map(item => item.EnergyUsage).sort((a, b) => a - b);
      
      // Calculate quartiles for inference time
      const inferenceQ1 = inferenceValues[Math.floor(inferenceValues.length * 0.25)];
      const inferenceQ2 = inferenceValues[Math.floor(inferenceValues.length * 0.5)];
      const inferenceQ3 = inferenceValues[Math.floor(inferenceValues.length * 0.75)];
      
      // Calculate quartiles for energy
      const energyQ1 = energyValues[Math.floor(energyValues.length * 0.25)];
      const energyQ2 = energyValues[Math.floor(energyValues.length * 0.5)];
      const energyQ3 = energyValues[Math.floor(energyValues.length * 0.75)];
      
      return {
        model,
        inferenceMin: inferenceValues[0],
        inferenceQ1,
        inferenceQ2,
        inferenceQ3,
        inferenceMax: inferenceValues[inferenceValues.length - 1],
        energyMin: energyValues[0],
        energyQ1,
        energyQ2,
        energyQ3,
        energyMax: energyValues[energyValues.length - 1],
        color: colors[index % colors.length]
      };
    });
  }, [data]);

  // Prepare heat map data for all three variables
  const heatMapData = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.ModelName))];
    
    return models.map(model => {
      const modelData = data.filter(item => item.ModelName === model);
      
      // Calculate correlations (simplified Pearson correlation coefficient)
      const energyValues = modelData.map(item => item.EnergyUsage);
      const confidenceValues = modelData.map(item => item.MeanConfidence);
      const inferenceValues = modelData.map(item => item.MeanInference);
      
      const mean = (arr: number[]) => arr.reduce((sum, val) => sum + val, 0) / arr.length;
      const energyMean = mean(energyValues);
      const confidenceMean = mean(confidenceValues);
      const inferenceMean = mean(inferenceValues);
      
      const correlation = (arr1: number[], arr2: number[], mean1: number, mean2: number) => {
        const numerator = arr1.reduce((sum, val, i) => sum + (val - mean1) * (arr2[i] - mean2), 0);
        const denominator = Math.sqrt(
          arr1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) *
          arr2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0)
        );
        return denominator === 0 ? 0 : numerator / denominator;
      };
      
      return {
        model,
        energyConfidence: correlation(energyValues, confidenceValues, energyMean, confidenceMean),
        energyInference: correlation(energyValues, inferenceValues, energyMean, inferenceMean),
        confidenceInference: correlation(confidenceValues, inferenceValues, confidenceMean, inferenceMean)
      };
    });
  }, [data]);

  const BoxPlotTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">Min: {data.min?.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Q1: {data.q1?.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Median: {data.median?.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Q3: {data.q3?.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Max: {data.max?.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  const HeatMapTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">Energy-Confidence: {data.energyConfidence.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Energy-Inference: {data.energyInference.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Confidence-Inference: {data.confidenceInference.toFixed(3)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Energy vs Confidence Box Plot */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Confidence Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energyConfidenceBoxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="model"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip content={BoxPlotTooltip} />
              <Bar dataKey="confidenceQ2" name="Median Confidence">
                {energyConfidenceBoxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy vs Inference Time Box Plot */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Inference Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energyInferenceBoxData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="model"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                unit="ms"
              />
              <Tooltip content={BoxPlotTooltip} />
              <Bar dataKey="inferenceQ2" name="Median Inference Time">
                {energyInferenceBoxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Correlation Heat Map */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Correlation Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={heatMapData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="model"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[-1, 1]}
              />
              <Tooltip content={HeatMapTooltip} />
              <Legend />
              <Bar dataKey="energyConfidence" name="Energy-Confidence" fill="hsl(var(--chart-1))" />
              <Bar dataKey="energyInference" name="Energy-Inference" fill="hsl(var(--chart-2))" />
              <Bar dataKey="confidenceInference" name="Confidence-Inference" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};