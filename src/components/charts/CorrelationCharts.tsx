import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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
      
      // Calculate quartiles for confidence
      const confidenceQ1 = confidenceValues[Math.floor(confidenceValues.length * 0.25)];
      const confidenceQ2 = confidenceValues[Math.floor(confidenceValues.length * 0.5)];
      const confidenceQ3 = confidenceValues[Math.floor(confidenceValues.length * 0.75)];
      
      return {
        model,
        confidenceMin: confidenceValues[0],
        confidenceQ1,
        confidenceQ2,
        confidenceQ3,
        confidenceMax: confidenceValues[confidenceValues.length - 1],
        color: colors[index % colors.length],
        // Box plot visual data
        boxHeight: confidenceQ3 - confidenceQ1, // IQR
        boxStart: confidenceQ1,
        median: confidenceQ2,
        lowerWhisker: confidenceValues[0],
        upperWhisker: confidenceValues[confidenceValues.length - 1]
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
      
      // Calculate quartiles for inference time
      const inferenceQ1 = inferenceValues[Math.floor(inferenceValues.length * 0.25)];
      const inferenceQ2 = inferenceValues[Math.floor(inferenceValues.length * 0.5)];
      const inferenceQ3 = inferenceValues[Math.floor(inferenceValues.length * 0.75)];
      
      return {
        model,
        inferenceMin: inferenceValues[0],
        inferenceQ1,
        inferenceQ2,
        inferenceQ3,
        inferenceMax: inferenceValues[inferenceValues.length - 1],
        color: colors[index % colors.length],
        // Box plot visual data
        boxHeight: inferenceQ3 - inferenceQ1, // IQR
        boxStart: inferenceQ1,
        median: inferenceQ2,
        lowerWhisker: inferenceValues[0],
        upperWhisker: inferenceValues[inferenceValues.length - 1]
      };
    });
  }, [data]);

  const CustomBoxPlot = ({ data: plotData, isConfidence = false }: { data: any[], isConfidence?: boolean }) => {
    return (
      <div className="relative">
        {plotData.map((item, index) => {
          const xPosition = index * (100 / plotData.length) + (50 / plotData.length);
          const yScale = isConfidence ? 100 : 1; // Scale for percentage vs ms
          
          return (
            <div key={item.model} className="absolute" style={{ left: `${xPosition}%` }}>
              {/* Whiskers */}
              <div 
                className="absolute w-0.5 bg-muted-foreground"
                style={{ 
                  height: `${(item.upperWhisker - item.lowerWhisker) * yScale}px`,
                  top: `${400 - item.upperWhisker * yScale}px`,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
              {/* Box (IQR) */}
              <div
                className="absolute border-2 bg-opacity-50"
                style={{
                  width: '40px',
                  height: `${item.boxHeight * yScale}px`,
                  top: `${400 - (item.boxStart + item.boxHeight) * yScale}px`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: item.color,
                  borderColor: item.color
                }}
              />
              {/* Median line */}
              <div
                className="absolute w-10 h-0.5 bg-foreground"
                style={{
                  top: `${400 - item.median * yScale}px`,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Energy vs Confidence Box Plot */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Confidence Box Plot</CardTitle>
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
              <Tooltip content={(props) => {
                if (props.active && props.payload && props.payload.length) {
                  const data = props.payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                      <p className="font-medium">{data.model}</p>
                      <p className="text-sm text-muted-foreground">Min: {(data.confidenceMin * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Q1: {(data.confidenceQ1 * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Median: {(data.confidenceQ2 * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Q3: {(data.confidenceQ3 * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Max: {(data.confidenceMax * 100).toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }} />
              {/* Lower whisker */}
              <Bar dataKey="confidenceMin" fill="transparent" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
              {/* Box (Q1 to Q3) */}
              <Bar dataKey="boxHeight" stackId="box">
                {energyConfidenceBoxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
              {/* Median line */}
              <Bar dataKey="confidenceQ2" fill="hsl(var(--foreground))" />
              {/* Upper whisker */}
              <Bar dataKey="confidenceMax" fill="transparent" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Energy vs Inference Time Box Plot */}
      <Card className="chart-container">
        <CardHeader>
          <CardTitle>Energy vs Inference Time Box Plot</CardTitle>
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
              <Tooltip content={(props) => {
                if (props.active && props.payload && props.payload.length) {
                  const data = props.payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                      <p className="font-medium">{data.model}</p>
                      <p className="text-sm text-muted-foreground">Min: {data.inferenceMin.toFixed(2)}ms</p>
                      <p className="text-sm text-muted-foreground">Q1: {data.inferenceQ1.toFixed(2)}ms</p>
                      <p className="text-sm text-muted-foreground">Median: {data.inferenceQ2.toFixed(2)}ms</p>
                      <p className="text-sm text-muted-foreground">Q3: {data.inferenceQ3.toFixed(2)}ms</p>
                      <p className="text-sm text-muted-foreground">Max: {data.inferenceMax.toFixed(2)}ms</p>
                    </div>
                  );
                }
                return null;
              }} />
              {/* Box plot representation using stacked bars */}
              <Bar dataKey="inferenceQ1" stackId="1" fill="transparent" />
              <Bar dataKey="boxHeight" stackId="1">
                {energyInferenceBoxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
              <Bar dataKey="inferenceQ2" fill="hsl(var(--foreground))" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};