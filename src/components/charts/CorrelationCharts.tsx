import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitoringData } from '@/types/dashboard';

interface CorrelationChartsProps {
  data: MonitoringData[];
}

export const CorrelationCharts: React.FC<CorrelationChartsProps> = ({ data }) => {
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(data.map(item => item.SelectedModel)));
  }, [data]);

  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(uniqueModels));

  const chartData = useMemo(() => {
    const modelData: Record<string, { confidenceData: any[], batteryData: any[], predictionData: any[], cpuBatteryData: any[] }> = {};
    
    uniqueModels.forEach(model => {
      const modelItems = data.filter(item => item.SelectedModel === model);
      
      const confidenceData = modelItems.map((item, index) => ({
        x: item.InstantaneousConfidence,
        y: item.CPUUsage,
        model,
        id: index,
      }));

      const batteryData = modelItems.map((item, index) => ({
        x: item.InstantaneousConfidence,
        y: item.BatteryConsumption,
        model,
        id: index,
      }));

      const predictionData = modelItems.map((item, index) => ({
        x: item.CPUUsage,
        y: item.CurrentTotalPredictions,
        model,
        id: index,
      }));

      const cpuBatteryData = modelItems.map((item, index) => ({
        x: item.CPUUsage,
        y: item.BatteryConsumption,
        model,
        id: index,
      }));

      modelData[model] = { confidenceData, batteryData, predictionData, cpuBatteryData };
    });

    return modelData;
  }, [data, uniqueModels]);

  const toggleModel = (model: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(model)) {
      newSelected.delete(model);
    } else {
      newSelected.add(model);
    }
    setSelectedModels(newSelected);
  };

  const filteredData = useMemo(() => {
    const filtered: Record<string, { confidenceData: any[], batteryData: any[], predictionData: any[], cpuBatteryData: any[] }> = {};
    selectedModels.forEach(model => {
      if (chartData[model]) {
        filtered[model] = chartData[model];
      }
    });
    return filtered;
  }, [chartData, selectedModels]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Models to Display</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueModels.map((model, index) => (
              <Button
                key={model}
                variant={selectedModels.has(model) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleModel(model)}
                className="text-sm"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                {model}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confidence vs CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Confidence" 
                  domain={[0, 100]}
                  label={{ value: 'Confidence (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="CPU Usage" 
                  domain={[0, 100]}
                  label={{ value: 'CPU Usage (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                {Object.entries(filteredData).map(([model, modelData], index) => (
                  <Scatter
                    key={model}
                    name={model}
                    data={modelData.confidenceData}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confidence vs Battery Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Confidence" 
                  domain={[0, 100]}
                  label={{ value: 'Confidence (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Battery Consumption" 
                  domain={[0, 100]}
                  label={{ value: 'Battery Consumption', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                {Object.entries(filteredData).map(([model, modelData], index) => (
                  <Scatter
                    key={model}
                    name={model}
                    data={modelData.batteryData}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CPU vs Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="CPU" />
                <YAxis type="number" dataKey="y" name="Predictions" />
                <Tooltip />
                {Object.entries(filteredData).map(([model, modelData], index) => (
                  <Scatter
                    key={model}
                    name={model}
                    data={modelData.predictionData}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CPU vs Battery Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="CPU Usage" />
                <YAxis type="number" dataKey="y" name="Battery Consumption" />
                <Tooltip />
                {Object.entries(filteredData).map(([model, modelData], index) => (
                  <Scatter
                    key={model}
                    name={model}
                    data={modelData.cpuBatteryData}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};