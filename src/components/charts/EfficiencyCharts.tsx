import React, { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonitoringData } from '@/types/dashboard';

interface EfficiencyChartsProps {
  data: MonitoringData[];
}

export const EfficiencyCharts: React.FC<EfficiencyChartsProps> = ({ data }) => {
  // CPU Efficiency over time by each model
  const cpuEfficiencyData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    
    return sortedData.map((item, index) => {
      // CPU efficiency = Confidence / CPU Usage (higher is better)
      const cpuEfficiency = item.CPUUsage > 0 ? item.InstantaneousConfidence / item.CPUUsage : 0;
      
      return {
        index: index + 1,
        timestamp: new Date(item.Timestamp).toLocaleTimeString(),
        model: item.SelectedModel,
        cpuEfficiency: Number(cpuEfficiency.toFixed(3)),
        cpuUsage: item.CPUUsage,
        confidence: item.InstantaneousConfidence,
      };
    });
  }, [data]);

  // Battery Efficiency over time by each model
  const batteryEfficiencyData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    
    return sortedData.map((item, index) => {
      // Battery efficiency = Confidence / Battery Consumption (higher is better)
      const batteryEfficiency = item.BatteryConsumption > 0 ? item.InstantaneousConfidence / item.BatteryConsumption : 0;
      
      return {
        index: index + 1,
        timestamp: new Date(item.Timestamp).toLocaleTimeString(),
        model: item.SelectedModel,
        batteryEfficiency: Number(batteryEfficiency.toFixed(3)),
        batteryConsumption: item.BatteryConsumption,
        confidence: item.InstantaneousConfidence,
      };
    });
  }, [data]);

  // Model efficiency comparison
  const modelComparisonData = useMemo(() => {
    const modelStats: Record<string, { 
      totalCPU: number, 
      totalBattery: number, 
      totalConfidence: number, 
      count: number,
      totalInference: number 
    }> = {};

    data.forEach(item => {
      if (!modelStats[item.SelectedModel]) {
        modelStats[item.SelectedModel] = { 
          totalCPU: 0, 
          totalBattery: 0, 
          totalConfidence: 0, 
          count: 0,
          totalInference: 0 
        };
      }
      
      const stats = modelStats[item.SelectedModel];
      stats.totalCPU += item.CPUUsage;
      stats.totalBattery += item.BatteryConsumption;
      stats.totalConfidence += item.InstantaneousConfidence;
      stats.totalInference += item.InferenceTime || 0;
      stats.count += 1;
    });

    return Object.entries(modelStats).map(([model, stats]) => ({
      model,
      avgCPUEfficiency: stats.totalConfidence / stats.totalCPU,
      avgBatteryEfficiency: stats.totalConfidence / stats.totalBattery,
      avgCPUUsage: stats.totalCPU / stats.count,
      avgBatteryConsumption: stats.totalBattery / stats.count,
      avgConfidence: stats.totalConfidence / stats.count,
      avgInferenceTime: stats.totalInference / stats.count,
    }));
  }, [data]);

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="space-y-6">
      {/* CPU Efficiency over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CPU Efficiency Over Time by Model</CardTitle>
          <p className="text-sm text-muted-foreground">Efficiency = Confidence / CPU Usage (higher is better)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={cpuEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="index" 
                className="text-sm"
                label={{ value: 'Time Points', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                className="text-sm"
                label={{ value: 'CPU Efficiency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">Time Point: {label}</p>
                        <p className="text-sm">Model: {data.model}</p>
                        <p className="text-sm">CPU Efficiency: {data.cpuEfficiency}</p>
                        <p className="text-sm">CPU Usage: {data.cpuUsage}%</p>
                        <p className="text-sm">Confidence: {data.confidence.toFixed(2)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cpuEfficiency" 
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="CPU Efficiency"
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Battery Efficiency over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Battery Efficiency Over Time by Model</CardTitle>
          <p className="text-sm text-muted-foreground">Efficiency = Confidence / Battery Consumption (higher is better)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={batteryEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="index" 
                className="text-sm"
                label={{ value: 'Time Points', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                className="text-sm"
                label={{ value: 'Battery Efficiency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">Time Point: {label}</p>
                        <p className="text-sm">Model: {data.model}</p>
                        <p className="text-sm">Battery Efficiency: {data.batteryEfficiency}</p>
                        <p className="text-sm">Battery Consumption: {data.batteryConsumption}</p>
                        <p className="text-sm">Confidence: {data.confidence.toFixed(2)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="batteryEfficiency" 
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Battery Efficiency"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Efficiency Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Efficiency Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU Efficiency Comparison */}
            <div>
              <h4 className="text-md font-medium mb-3">Average CPU Efficiency by Model</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={modelComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="model" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm">CPU Efficiency: {data.avgCPUEfficiency.toFixed(3)}</p>
                            <p className="text-sm">Avg CPU Usage: {data.avgCPUUsage.toFixed(1)}%</p>
                            <p className="text-sm">Avg Confidence: {data.avgConfidence.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgCPUEfficiency" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Battery Efficiency Comparison */}
            <div>
              <h4 className="text-md font-medium mb-3">Average Battery Efficiency by Model</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={modelComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="model" className="text-sm" />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm">Battery Efficiency: {data.avgBatteryEfficiency.toFixed(3)}</p>
                            <p className="text-sm">Avg Battery Consumption: {data.avgBatteryConsumption.toFixed(2)}</p>
                            <p className="text-sm">Avg Confidence: {data.avgConfidence.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgBatteryEfficiency" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};