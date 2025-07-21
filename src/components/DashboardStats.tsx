import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Zap, Target, Clock } from 'lucide-react';
import { DashboardStats as StatsType } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: StatsType;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Data Points',
      value: stats.totalDataPoints.toLocaleString(),
      icon: TrendingUp,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10'
    },
    {
      title: 'Avg Energy Usage',
      value: `${stats.avgEnergyUsage.toFixed(2)}J`,
      icon: Zap,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    },
    {
      title: 'Avg Confidence',
      value: `${(stats.avgConfidence * 100).toFixed(1)}%`,
      icon: Target,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10'
    },
    {
      title: 'Avg Inference Time',
      value: `${stats.avgInferenceTime.toFixed(2)}ms`,
      icon: Clock,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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