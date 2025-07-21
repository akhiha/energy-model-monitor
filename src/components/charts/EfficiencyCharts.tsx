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
    
    const cpuData = sortedData.map((item, index) => {
      const baseData: any = { 
        timePoint: index + 1,
        timestamp: new Date(item.Timestamp).toLocaleTimeString()
      };
      
      uniqueModels.forEach(model => {
        if (item.SelectedModel === model) {
          baseData[model] = item.CPUUsage > 0 ? Number((item.InstantaneousConfidence / item.CPUUsage).toFixed(2)) : 0;
        }
      });
      
      return baseData;
    });

    const batteryData = sortedData.map((item, index) => {
      const baseData: any = { 
        timePoint: index + 1,
        timestamp: new Date(item.Timestamp).toLocaleTimeString()
      };
      
      uniqueModels.forEach(model => {
        if (item.SelectedModel === model) {
          baseData[model] = item.BatteryConsumption > 0 ? Number((item.InstantaneousConfidence / item.BatteryConsumption).toFixed(2)) : 0;
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
              <YAxis />
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
              <YAxis />
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