import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MonitoringData } from '@/types/dashboard';
import { TrendingUp, Zap } from 'lucide-react';

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
              modelValue = cpuUsage > 0 ? Math.min(100, Number((sortedData[i].InstantaneousConfidence / cpuUsage).toFixed(2))) : 0;
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
              modelValue = batteryConsumption > 0 ? Math.min(100, Number((sortedData[i].InstantaneousConfidence / batteryConsumption).toFixed(2))) : 0;
            }
          }
          baseData[model] = modelValue;
        }
      });
      
      return baseData;
    });

    return { cpuEfficiencyData: cpuData, batteryEfficiencyData: batteryData };
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
            Efficiency = Confidence / CPU Usage
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cpuEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timePoint" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {Array.from(selectedModels).map((model) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={modelColors[model as keyof typeof modelColors] || '#6B7280'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
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
            Efficiency = Confidence / Battery Consumption
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={batteryEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timePoint" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              {Array.from(selectedModels).map((model) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={modelColors[model as keyof typeof modelColors] || '#6B7280'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};