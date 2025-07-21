import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Zap, Target, Battery, Cpu, Activity, Database } from 'lucide-react';
import { DashboardStats as StatsType } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: StatsType;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Data Points',
      value: stats.totalDataPoints.toLocaleString(),
      icon: Database,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10'
    },
    {
      title: 'Total Models',
      value: stats.totalModels.toString(),
      icon: TrendingUp,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    },
    {
      title: 'Total CPU Usage',
      value: `${stats.totalCPUUsage.toFixed(1)}%`,
      icon: Cpu,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10'
    },
    {
      title: 'Battery Consumption',
      value: `${stats.totalBatteryConsumption.toFixed(2)}`,
      icon: Battery,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10'
    },
    {
      title: 'Avg Confidence',
      value: `${stats.avgInstantaneousConfidence.toFixed(1)}%`,
      icon: Target,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10'
    },
    {
      title: 'Avg Battery Level',
      value: `${stats.avgBatteryLevel.toFixed(0)}%`,
      icon: Activity,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10'
    },
    {
      title: 'Total Predictions',
      value: stats.totalPredictions.toLocaleString(),
      icon: Zap,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="metric-card">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};