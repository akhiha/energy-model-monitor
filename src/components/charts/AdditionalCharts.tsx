import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitoringData } from '@/types/dashboard';

interface AdditionalChartsProps {
  data: MonitoringData[];
}

export const AdditionalCharts: React.FC<AdditionalChartsProps> = ({ data }) => {
  // Get unique models
  const models = [...new Set(data.map(item => item.ModelName))].slice(0, 4);
  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
  
  // State for model selection
  const [selectedModels, setSelectedModels] = useState<string[]>(models);

  // Toggle model visibility
  const toggleModel = (model: string) => {
    setSelectedModels(prev => 
      prev.includes(model) 
        ? prev.filter(m => m !== model)
        : [...prev, model]
    );
  };

  // Energy efficiency over time data separated by model
  const energyEfficiencyByModel = React.useMemo(() => {
    const sortedData = [...data].sort((a, b) => a.ID - b.ID);
    
    // Create a complete timeline with all IDs
    const allIDs = [...new Set(sortedData.map(item => item.ID))].sort((a, b) => a - b);
    
    return allIDs.map(id => {
      const baseEntry: any = { ID: id };
      
      models.forEach(model => {
        const modelData = sortedData.find(item => item.ID === id && item.ModelName === model);
        if (modelData) {
          baseEntry[model] = modelData.EnergyPerConfidence || (modelData.EnergyUsage / Math.max(modelData.MeanConfidence, 0.001));
        }
      });
      
      return baseEntry;
    });
  }, [data, models]);

  // Model efficiency analysis
  const modelEfficiencyData = React.useMemo(() => {
    const modelStats = data.reduce((acc, item) => {
      if (!acc[item.ModelName]) {
        acc[item.ModelName] = {
          totalEnergy: 0,
          totalConfidence: 0,
          totalInference: 0,
          count: 0
        };
      }
      
      acc[item.ModelName].totalEnergy += item.EnergyUsage;
      acc[item.ModelName].totalConfidence += item.MeanConfidence;
      acc[item.ModelName].totalInference += item.MeanInference;
      acc[item.ModelName].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(modelStats).map(([model, stats]) => ({
      model,
      totalEnergy: stats.totalEnergy,
      avgConfidence: stats.totalConfidence / stats.count,
      avgInference: stats.totalInference / stats.count,
      efficiency: (stats.totalConfidence / stats.count) / (stats.totalEnergy / stats.count), // Confidence per unit energy
      count: stats.count
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium">ID: {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
            </p>
          ))}
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
          <CardTitle>Model Selection for Energy Efficiency</CardTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Efficiency Over Time by Model */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Energy Efficiency Over Time by Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={energyEfficiencyByModel}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="ID" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                {selectedModels.map((model, index) => (
                  <Line
                    key={model}
                    type="monotone"
                    dataKey={model}
                    stroke={colors[models.indexOf(model)]}
                    strokeWidth={2}
                    dot={{ fill: colors[models.indexOf(model)], strokeWidth: 2, r: 3 }}
                    name={model}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Efficiency Comparison */}
        <Card className="chart-container">
          <CardHeader>
            <CardTitle>Model Efficiency Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={modelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="model" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            Total Energy: {data.totalEnergy.toFixed(2)}J
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg Confidence: {(data.avgConfidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg Inference: {data.avgInference.toFixed(2)}ms
                          </p>
                          <p className="text-sm text-chart-4 font-medium">
                            Efficiency: {data.efficiency.toFixed(3)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sample Count: {data.count}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar
                  dataKey="efficiency"
                  fill="hsl(var(--chart-4))"
                  name="Efficiency (Confidence/Energy)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};