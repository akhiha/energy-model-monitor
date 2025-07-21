import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LLMStats } from '@/types/llm';
import { Zap, Brain, Thermometer, BarChart3, Activity, Hash } from 'lucide-react';

interface LLMDashboardStatsProps {
  stats: LLMStats;
}

export const LLMDashboardStats: React.FC<LLMDashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Models',
      value: stats.totalModels,
      icon: Brain,
      format: (value: number) => value.toString(),
      color: 'text-chart-1'
    },
    {
      title: 'Data Points',
      value: stats.totalDataPoints,
      icon: BarChart3,
      format: (value: number) => value.toLocaleString(),
      color: 'text-chart-2'
    },
    {
      title: 'Avg Energy Usage',
      value: stats.avgEnergyUsage,
      icon: Zap,
      format: (value: number) => `${(value * 100).toFixed(1)}%`,
      color: 'text-chart-3'
    },
    {
      title: 'Avg EWMA Score',
      value: stats.avgEWMAScore,
      icon: Activity,
      format: (value: number) => `${(value * 100).toFixed(1)}%`,
      color: 'text-chart-4'
    },
    {
      title: 'Avg Input Tokens',
      value: stats.avgInputTokenSize,
      icon: Hash,
      format: (value: number) => Math.round(value).toString(),
      color: 'text-chart-5'
    },
    {
      title: 'Avg Output Tokens',
      value: stats.avgOutputTokenSize,
      icon: Hash,
      format: (value: number) => Math.round(value).toString(),
      color: 'text-chart-1'
    },
    {
      title: 'Avg Temperature',
      value: stats.avgTemperature,
      icon: Thermometer,
      format: (value: number) => `${value.toFixed(1)}°C`,
      color: 'text-chart-2'
    },
    {
      title: 'Total Energy Consumption',
      value: stats.totalEnergyConsumption,
      icon: Zap,
      format: (value: number) => `${value.toFixed(2)}`,
      color: 'text-chart-3'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.format(stat.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};