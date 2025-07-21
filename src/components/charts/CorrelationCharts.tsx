import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (arr1: number[], arr2: number[]): number => {
    if (arr1.length !== arr2.length || arr1.length < 2) return 0;
    
    const mean1 = arr1.reduce((sum, val) => sum + val, 0) / arr1.length;
    const mean2 = arr2.reduce((sum, val) => sum + val, 0) / arr2.length;
    
    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    
    for (let i = 0; i < arr1.length; i++) {
      const diff1 = arr1[i] - mean1;
      const diff2 = arr2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Bootstrap correlation for Energy vs Confidence
  const energyConfidenceCorrelations = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.ModelName))];
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    const nBootstrap = 100; // Reduced for performance
    
    return models.map((model, index) => {
      const modelData = data.filter(item => item.ModelName === model);
      const energyValues = modelData.map(item => item.EnergyUsage);
      const confidenceValues = modelData.map(item => item.MeanConfidence);
      
      if (modelData.length < 10) {
        return {
          model,
          correlations: [0],
          median: 0,
          q1: 0,
          q3: 0,
          min: 0,
          max: 0,
          color: colors[index % colors.length]
        };
      }
      
      // Bootstrap sampling
      const correlations = [];
      for (let i = 0; i < nBootstrap; i++) {
        const sampleIndices = Array.from({ length: modelData.length }, () => 
          Math.floor(Math.random() * modelData.length)
        );
        const sampleEnergy = sampleIndices.map(idx => energyValues[idx]);
        const sampleConfidence = sampleIndices.map(idx => confidenceValues[idx]);
        
        const correlation = calculateCorrelation(sampleEnergy, sampleConfidence);
        correlations.push(correlation);
      }
      
      correlations.sort((a, b) => a - b);
      const q1 = correlations[Math.floor(correlations.length * 0.25)];
      const median = correlations[Math.floor(correlations.length * 0.5)];
      const q3 = correlations[Math.floor(correlations.length * 0.75)];
      
      return {
        model,
        correlations,
        median,
        q1,
        q3,
        min: correlations[0],
        max: correlations[correlations.length - 1],
        color: colors[index % colors.length]
      };
    });
  }, [data]);

  // Bootstrap correlation for Energy vs Inference Time
  const energyInferenceCorrelations = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.ModelName))];
    const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
    const nBootstrap = 100;
    
    return models.map((model, index) => {
      const modelData = data.filter(item => item.ModelName === model);
      const energyValues = modelData.map(item => item.EnergyUsage);
      const inferenceValues = modelData.map(item => item.MeanInference);
      
      if (modelData.length < 10) {
        return {
          model,
          correlations: [0],
          median: 0,
          q1: 0,
          q3: 0,
          min: 0,
          max: 0,
          color: colors[index % colors.length]
        };
      }
      
      // Bootstrap sampling
      const correlations = [];
      for (let i = 0; i < nBootstrap; i++) {
        const sampleIndices = Array.from({ length: modelData.length }, () => 
          Math.floor(Math.random() * modelData.length)
        );
        const sampleEnergy = sampleIndices.map(idx => energyValues[idx]);
        const sampleInference = sampleIndices.map(idx => inferenceValues[idx]);
        
        const correlation = calculateCorrelation(sampleEnergy, sampleInference);
        correlations.push(correlation);
      }
      
      correlations.sort((a, b) => a - b);
      const q1 = correlations[Math.floor(correlations.length * 0.25)];
      const median = correlations[Math.floor(correlations.length * 0.5)];
      const q3 = correlations[Math.floor(correlations.length * 0.75)];
      
      return {
        model,
        correlations,
        median,
        q1,
        q3,
        min: correlations[0],
        max: correlations[correlations.length - 1],
        color: colors[index % colors.length]
      };
    });
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Energy vs Confidence Correlation Box Plot */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy–Confidence Correlation Box Plot</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energyConfidenceCorrelations}>
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
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={(props) => {
                if (props.active && props.payload && props.payload.length) {
                  const data = props.payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                      <p className="font-medium">{data.model}</p>
                      <p className="text-sm text-muted-foreground">Correlation Range:</p>
                      <p className="text-sm text-muted-foreground">Min: {data.min.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Q1: {data.q1.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Median: {data.median.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Q3: {data.q3.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Max: {data.max.toFixed(3)}</p>
                    </div>
                  );
                }
                return null;
              }} />
              {/* Box plot visualization */}
              <Bar dataKey="q1" fill="transparent" />
              <Bar dataKey="median" stackId="box">
                {energyConfidenceCorrelations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="q3" fill="transparent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy vs Inference Time Correlation Box Plot */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy–Inference Time Correlation Box Plot</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={energyInferenceCorrelations}>
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
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip content={(props) => {
                if (props.active && props.payload && props.payload.length) {
                  const data = props.payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                      <p className="font-medium">{data.model}</p>
                      <p className="text-sm text-muted-foreground">Correlation Range:</p>
                      <p className="text-sm text-muted-foreground">Min: {data.min.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Q1: {data.q1.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Median: {data.median.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Q3: {data.q3.toFixed(3)}</p>
                      <p className="text-sm text-muted-foreground">Max: {data.max.toFixed(3)}</p>
                    </div>
                  );
                }
                return null;
              }} />
              {/* Box plot visualization */}
              <Bar dataKey="q1" fill="transparent" />
              <Bar dataKey="median" stackId="box">
                {energyInferenceCorrelations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="q3" fill="transparent" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};