import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitoringData } from '@/types/dashboard';
import { TrendingUp, Zap, BarChart3 } from 'lucide-react';

interface EfficiencyChartsProps {
  data: MonitoringData[];
}

export const EfficiencyCharts: React.FC<EfficiencyChartsProps> = ({ data }) => {
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(data.map(item => item.SelectedModel)));
  }, [data]);

  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(uniqueModels));

  const modelColors = {
    'MobileNet V1': '#3B82F6',
    'EfficientDet Lite0': '#10B981', 
    'EfficientDet Lite1': '#8B5CF6',
    'EfficientDet Lite2': '#EF4444',
    'EfficientNetB0': '#F59E0B',
    'MobileNetV3': '#06B6D4',
    'ResNet50': '#F97316',
  };

  const { cpuEfficiencyData, batteryEfficiencyData } = useMemo(() => {
    if (!data || data.length === 0) return { cpuEfficiencyData: [], batteryEfficiencyData: [] };

    const sortedData = [...data].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    
    // Group data by model to create continuous lines
    const modelGroups: Record<string, typeof sortedData> = {};
    sortedData.forEach(item => {
      if (!modelGroups[item.SelectedModel]) {
        modelGroups[item.SelectedModel] = [];
      }
      modelGroups[item.SelectedModel].push(item);
    });

    // Create time series for all data points
    const allTimePoints = sortedData.map((_, index) => index + 1);
    
    const cpuData = allTimePoints.map(timePoint => {
      const item = sortedData[timePoint - 1];
      const baseData: any = { 
        timePoint,
        timestamp: new Date(item.Timestamp).toLocaleTimeString()
      };
      
      // Add efficiency values for each model at this time point
      uniqueModels.forEach(model => {
        const modelData = modelGroups[model];
        if (modelData && modelData.length > 0) {
          // Find the most recent data point for this model up to current time
          let modelValue = null;
          for (let i = 0; i < timePoint; i++) {
            if (sortedData[i] && sortedData[i].SelectedModel === model) {
              const cpuUsage = sortedData[i].CPUUsage;
              const confidence = sortedData[i].InstantaneousConfidence;
              modelValue = confidence > 0 ? Number((cpuUsage / confidence).toFixed(2)) : 0;
            }
          }
          baseData[model] = modelValue;
        }
      });
      
      return baseData;
    });

    const batteryData = allTimePoints.map(timePoint => {
      const item = sortedData[timePoint - 1];
      const baseData: any = { 
        timePoint,
        timestamp: new Date(item.Timestamp).toLocaleTimeString()
      };
      
      // Add efficiency values for each model at this time point
      uniqueModels.forEach(model => {
        const modelData = modelGroups[model];
        if (modelData && modelData.length > 0) {
          // Find the most recent data point for this model up to current time
          let modelValue = null;
          for (let i = 0; i < timePoint; i++) {
            if (sortedData[i] && sortedData[i].SelectedModel === model) {
              const batteryConsumption = sortedData[i].BatteryConsumption;
              const confidence = sortedData[i].InstantaneousConfidence;
              modelValue = confidence > 0 ? Number((batteryConsumption / confidence).toFixed(2)) : 0;
            }
          }
          baseData[model] = modelValue;
        }
      });
      
      return baseData;
    });

    return { cpuEfficiencyData: cpuData, batteryEfficiencyData: batteryData };
  }, [data, uniqueModels]);

  // Calculate dynamic Y-axis domain for better visibility
  const getYAxisDomain = (chartData: any[], models: string[]) => {
    let allValues: number[] = [];
    chartData.forEach(point => {
      models.forEach(model => {
        if (point[model] !== null && point[model] !== undefined) {
          allValues.push(point[model]);
        }
      });
    });
    
    if (allValues.length === 0) return [0, 100];
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min;
    const padding = range * 0.1; // 10% padding
    
    return [
      Math.max(0, Math.floor(min - padding)), 
      Math.min(100, Math.ceil(max + padding))
    ];
  };

  const toggleModel = (model: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(model)) {
      newSelected.delete(model);
    } else {
      newSelected.add(model);
    }
    setSelectedModels(newSelected);
  };

  // Calculate model efficiency comparison data with complete parameters
  const modelEfficiencyData = useMemo(() => {
    const modelStats: Record<string, { 
      totalCPU: number, 
      totalBattery: number, 
      totalConfidence: number, 
      count: number,
      modelEfficiencySum: number,
      cpuEfficiencySum: number,
      batteryEfficiencySum: number,
      maxConfidence: number,
    }> = {};

    data.forEach(item => {
      if (!modelStats[item.SelectedModel]) {
        modelStats[item.SelectedModel] = { 
          totalCPU: 0, 
          totalBattery: 0, 
          totalConfidence: 0, 
          count: 0,
          modelEfficiencySum: 0,
          cpuEfficiencySum: 0,
          batteryEfficiencySum: 0,
          maxConfidence: 0,
        };
      }
      
      const stats = modelStats[item.SelectedModel];
      // Model Efficiency = Confidence / CPU Usage
      const modelEff = item.CPUUsage > 0 ? item.InstantaneousConfidence / item.CPUUsage : 0;
      // CPU efficiency = CPU / confidence
      const cpuEff = item.InstantaneousConfidence > 0 ? item.CPUUsage / item.InstantaneousConfidence : 0;
      // Battery efficiency = Battery / confidence  
      const batteryEff = item.InstantaneousConfidence > 0 ? item.BatteryConsumption / item.InstantaneousConfidence : 0;
      
      stats.totalCPU += item.CPUUsage;
      stats.totalBattery += item.BatteryConsumption;
      stats.totalConfidence += item.InstantaneousConfidence;
      stats.modelEfficiencySum += modelEff;
      stats.cpuEfficiencySum += cpuEff;
      stats.batteryEfficiencySum += batteryEff;
      stats.maxConfidence = Math.max(stats.maxConfidence, item.InstantaneousConfidence);
      stats.count += 1;
    });

    return Object.entries(modelStats).map(([model, stats]) => ({
      model,
      modelEfficiency: Number((stats.modelEfficiencySum / stats.count).toFixed(3)),
      cpuEfficiency: Number((stats.cpuEfficiencySum / stats.count).toFixed(3)),
      batteryEfficiency: Number((stats.batteryEfficiencySum / stats.count).toFixed(3)),
      avgCPUUsage: Number((stats.totalCPU / stats.count).toFixed(1)),
      avgBatteryConsumption: Number((stats.totalBattery / stats.count).toFixed(2)),
      avgConfidence: Number((stats.totalConfidence / stats.count).toFixed(1)),
      maxConfidence: Number(stats.maxConfidence.toFixed(1)),
      totalDataPoints: stats.count,
      color: modelColors[model as keyof typeof modelColors] || '#6B7280'
    }));
  }, [data]);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border-2 border-primary/20 rounded-xl shadow-2xl p-4 backdrop-blur-sm">
          <p className="text-sm font-bold text-primary mb-2">{label}</p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Model Efficiency:</p>
                <p className="font-bold text-primary">{data.modelEfficiency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data Points:</p>
                <p className="font-bold">{data.totalDataPoints}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg CPU Usage:</p>
                <p className="font-bold">{data.avgCPUUsage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Battery:</p>
                <p className="font-bold">{data.avgBatteryConsumption}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Confidence:</p>
                <p className="font-bold">{data.avgConfidence}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Max Confidence:</p>
                <p className="font-bold">{data.maxConfidence}%</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueModels.map((model) => {
              const isSelected = selectedModels.has(model);
              const modelColor = modelColors[model as keyof typeof modelColors] || '#6B7280';
              
              return (
                <Button
                  key={model}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleModel(model)}
                  className="text-sm"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: modelColor }}
                  />
                  {model}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CPU Efficiency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            CPU Efficiency Over Time by Model
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Efficiency = CPU Usage / Confidence
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cpuEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timePoint" />
              <YAxis domain={getYAxisDomain(cpuEfficiencyData, Array.from(selectedModels))} />
              <Tooltip />
              <Legend />
              {Array.from(selectedModels).map((model) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={modelColors[model as keyof typeof modelColors] || '#6B7280'}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Battery Efficiency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Battery Efficiency Over Time by Model
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Efficiency = Battery Consumption / Confidence
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={batteryEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timePoint" />
              <YAxis domain={getYAxisDomain(batteryEfficiencyData, Array.from(selectedModels))} />
              <Tooltip />
              <Legend />
              {Array.from(selectedModels).map((model) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={modelColors[model as keyof typeof modelColors] || '#6B7280'}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Efficiency Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Model Efficiency Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Model Efficiency = Confidence / CPU Usage
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={modelEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip content={CustomBarTooltip} />
                <Bar dataKey="modelEfficiency" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};