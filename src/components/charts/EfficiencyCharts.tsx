import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonitoringData } from '@/types/dashboard';
import { TrendingUp, Zap, Award, Target } from 'lucide-react';

interface EfficiencyChartsProps {
  data: MonitoringData[];
}

export const EfficiencyCharts: React.FC<EfficiencyChartsProps> = ({ data }) => {
  // Get unique models
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(data.map(item => item.SelectedModel)));
  }, [data]);

  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set(uniqueModels));

  // Enhanced colors with gradients
  const modelColors = {
    'MobileNet V1': 'hsl(220, 70%, 50%)',
    'EfficientDet Lite0': 'hsl(142, 76%, 36%)', 
    'EfficientDet Lite1': 'hsl(262, 83%, 58%)',
    'EfficientDet Lite2': 'hsl(346, 77%, 49%)',
    'EfficientNetB0': 'hsl(47, 96%, 53%)',
    'MobileNetV3': 'hsl(199, 89%, 48%)',
    'ResNet50': 'hsl(24, 70%, 50%)',
  };

  // Generate chart data with normalized starting points for each model
  const { cpuEfficiencyData, batteryEfficiencyData } = useMemo(() => {
    const sortedData = [...data].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    
    // Group data by model
    const modelGroups: Record<string, typeof sortedData> = {};
    sortedData.forEach(item => {
      if (!modelGroups[item.SelectedModel]) {
        modelGroups[item.SelectedModel] = [];
      }
      modelGroups[item.SelectedModel].push(item);
    });

    // Create normalized time series data
    const maxDataPoints = Math.max(...Object.values(modelGroups).map(group => group.length));
    const timePoints = Array.from({ length: maxDataPoints }, (_, i) => i + 1);

    const cpuData = timePoints.map(timePoint => {
      const dataPoint: any = { timePoint };
      
      Object.entries(modelGroups).forEach(([model, modelData]) => {
        const dataIndex = Math.min(timePoint - 1, modelData.length - 1);
        const item = modelData[dataIndex];
        
        if (item) {
          const cpuEfficiency = item.CPUUsage > 0 ? item.InstantaneousConfidence / item.CPUUsage : 0;
          dataPoint[model] = Number(cpuEfficiency.toFixed(3));
          dataPoint[`${model}_meta`] = {
            cpuUsage: item.CPUUsage,
            confidence: item.InstantaneousConfidence,
            timestamp: new Date(item.Timestamp).toLocaleTimeString()
          };
        }
      });
      
      return dataPoint;
    });

    const batteryData = timePoints.map(timePoint => {
      const dataPoint: any = { timePoint };
      
      Object.entries(modelGroups).forEach(([model, modelData]) => {
        const dataIndex = Math.min(timePoint - 1, modelData.length - 1);
        const item = modelData[dataIndex];
        
        if (item) {
          const batteryEfficiency = item.BatteryConsumption > 0 ? item.InstantaneousConfidence / item.BatteryConsumption : 0;
          dataPoint[model] = Number(batteryEfficiency.toFixed(3));
          dataPoint[`${model}_meta`] = {
            batteryConsumption: item.BatteryConsumption,
            confidence: item.InstantaneousConfidence,
            timestamp: new Date(item.Timestamp).toLocaleTimeString()
          };
        }
      });
      
      return dataPoint;
    });

    return { cpuEfficiencyData: cpuData, batteryEfficiencyData: batteryData };
  }, [data]);

  // Model efficiency comparison with enhanced metrics
  const modelComparisonData = useMemo(() => {
    const modelStats: Record<string, { 
      totalCPU: number, 
      totalBattery: number, 
      totalConfidence: number, 
      count: number,
      maxCPUEfficiency: number,
      maxBatteryEfficiency: number,
    }> = {};

    data.forEach(item => {
      if (!modelStats[item.SelectedModel]) {
        modelStats[item.SelectedModel] = { 
          totalCPU: 0, 
          totalBattery: 0, 
          totalConfidence: 0, 
          count: 0,
          maxCPUEfficiency: 0,
          maxBatteryEfficiency: 0,
        };
      }
      
      const stats = modelStats[item.SelectedModel];
      const cpuEff = item.CPUUsage > 0 ? item.InstantaneousConfidence / item.CPUUsage : 0;
      const batteryEff = item.BatteryConsumption > 0 ? item.InstantaneousConfidence / item.BatteryConsumption : 0;
      
      stats.totalCPU += item.CPUUsage;
      stats.totalBattery += item.BatteryConsumption;
      stats.totalConfidence += item.InstantaneousConfidence;
      stats.maxCPUEfficiency = Math.max(stats.maxCPUEfficiency, cpuEff);
      stats.maxBatteryEfficiency = Math.max(stats.maxBatteryEfficiency, batteryEff);
      stats.count += 1;
    });

    return Object.entries(modelStats).map(([model, stats]) => ({
      model,
      avgCPUEfficiency: Number((stats.totalConfidence / stats.totalCPU).toFixed(3)),
      avgBatteryEfficiency: Number((stats.totalConfidence / stats.totalBattery).toFixed(3)),
      maxCPUEfficiency: Number(stats.maxCPUEfficiency.toFixed(3)),
      maxBatteryEfficiency: Number(stats.maxBatteryEfficiency.toFixed(3)),
      avgCPUUsage: Number((stats.totalCPU / stats.count).toFixed(1)),
      avgBatteryConsumption: Number((stats.totalBattery / stats.count).toFixed(2)),
      avgConfidence: Number((stats.totalConfidence / stats.count).toFixed(1)),
      color: modelColors[model as keyof typeof modelColors] || `hsl(${Math.random() * 360}, 70%, 50%)`,
    })).sort((a, b) => b.avgCPUEfficiency - a.avgCPUEfficiency);
  }, [data]);

  const toggleModel = (model: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(model)) {
      newSelected.delete(model);
    } else {
      newSelected.add(model);
    }
    setSelectedModels(newSelected);
  };

  const CustomTooltip = ({ active, payload, label, dataKey }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border-2 border-primary/20 rounded-xl shadow-2xl p-4 backdrop-blur-sm">
          <p className="text-sm font-bold text-primary mb-2">Time Point: {label}</p>
          {payload.map((entry: any, index: number) => {
            const meta = entry.payload[`${entry.dataKey}_meta`];
            return (
              <div key={index} className="mb-2 p-2 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <p className="text-sm font-semibold">{entry.dataKey}</p>
                </div>
                <p className="text-sm">
                  {dataKey === 'cpu' ? 'CPU' : 'Battery'} Efficiency: 
                  <span className="font-bold text-primary ml-1">{entry.value}</span>
                </p>
                {meta && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <p>Confidence: {meta.confidence.toFixed(1)}%</p>
                    <p>{dataKey === 'cpu' ? `CPU Usage: ${meta.cpuUsage}%` : `Battery: ${meta.batteryConsumption}`}</p>
                    <p>Time: {meta.timestamp}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Model Selection */}
      <Card className="overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-chart-2/10 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Model Selection Control
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {uniqueModels.map((model) => {
              const isSelected = selectedModels.has(model);
              const modelColor = modelColors[model as keyof typeof modelColors] || `hsl(${Math.random() * 360}, 70%, 50%)`;
              
              return (
                <Button
                  key={model}
                  variant={isSelected ? "default" : "outline"}
                  size="lg"
                  onClick={() => toggleModel(model)}
                  className={`text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'border-2 hover:border-primary/50'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full mr-2 border-2 border-white/50" 
                    style={{ backgroundColor: modelColor }}
                  />
                  {model}
                  {isSelected && <Award className="ml-2 h-4 w-4" />}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced CPU Efficiency Chart */}
      <Card className="overflow-hidden bg-gradient-to-br from-background via-background to-chart-1/5 border-2 border-chart-1/20">
        <CardHeader className="bg-gradient-to-r from-chart-1/10 to-chart-3/10 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-chart-1" />
            CPU Efficiency Over Time by Model
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">
            Efficiency = Confidence / CPU Usage • Higher values indicate better performance
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={cpuEfficiencyData}>
              <defs>
                {Array.from(selectedModels).map(model => (
                  <linearGradient key={model} id={`gradient-${model}-cpu`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={modelColors[model as keyof typeof modelColors]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={modelColors[model as keyof typeof modelColors]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="timePoint" 
                className="text-sm font-medium"
                label={{ value: 'Time Points (Normalized)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                className="text-sm font-medium"
                label={{ value: 'CPU Efficiency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} dataKey="cpu" />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {Array.from(selectedModels).map((model, index) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={modelColors[model as keyof typeof modelColors]}
                  strokeWidth={3}
                  dot={{ 
                    fill: modelColors[model as keyof typeof modelColors], 
                    strokeWidth: 2, 
                    r: 4,
                    className: "drop-shadow-lg"
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: modelColors[model as keyof typeof modelColors],
                    strokeWidth: 3,
                    fill: "white",
                    className: "drop-shadow-xl"
                  }}
                  name={model}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Battery Efficiency Chart */}
      <Card className="overflow-hidden bg-gradient-to-br from-background via-background to-chart-2/5 border-2 border-chart-2/20">
        <CardHeader className="bg-gradient-to-r from-chart-2/10 to-chart-4/10 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-chart-2" />
            Battery Efficiency Over Time by Model
          </CardTitle>
          <p className="text-sm text-muted-foreground font-medium">
            Efficiency = Confidence / Battery Consumption • Higher values indicate better performance
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={batteryEfficiencyData}>
              <defs>
                {Array.from(selectedModels).map(model => (
                  <linearGradient key={model} id={`gradient-${model}-battery`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={modelColors[model as keyof typeof modelColors]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={modelColors[model as keyof typeof modelColors]} stopOpacity={0.1}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="timePoint" 
                className="text-sm font-medium"
                label={{ value: 'Time Points (Normalized)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                className="text-sm font-medium"
                label={{ value: 'Battery Efficiency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} dataKey="battery" />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {Array.from(selectedModels).map((model, index) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  stroke={modelColors[model as keyof typeof modelColors]}
                  strokeWidth={3}
                  dot={{ 
                    fill: modelColors[model as keyof typeof modelColors], 
                    strokeWidth: 2, 
                    r: 4,
                    className: "drop-shadow-lg"
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: modelColors[model as keyof typeof modelColors],
                    strokeWidth: 3,
                    fill: "white",
                    className: "drop-shadow-xl"
                  }}
                  name={model}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Model Efficiency Comparison */}
      <Card className="overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/10">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-chart-5/10 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Model Performance Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CPU Efficiency Ranking */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                CPU Efficiency Champions
              </h4>
              <div className="space-y-3">
                {modelComparisonData.map((model, index) => (
                  <div 
                    key={model.model} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-background border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-102"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          index === 1 ? 'bg-gray-100 text-gray-800 border-gray-300' :
                          index === 2 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="font-semibold">{model.model}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">{model.avgCPUEfficiency}</p>
                      <p className="text-xs text-muted-foreground">Avg Efficiency</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery Efficiency Ranking */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-chart-2 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Battery Efficiency Champions
              </h4>
              <div className="space-y-3">
                {[...modelComparisonData].sort((a, b) => b.avgBatteryEfficiency - a.avgBatteryEfficiency).map((model, index) => (
                  <div 
                    key={model.model} 
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-background border border-chart-2/10 hover:border-chart-2/30 transition-all duration-300 hover:scale-102"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          index === 1 ? 'bg-gray-100 text-gray-800 border-gray-300' :
                          index === 2 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="font-semibold">{model.model}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-chart-2">{model.avgBatteryEfficiency}</p>
                      <p className="text-xs text-muted-foreground">Avg Efficiency</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};