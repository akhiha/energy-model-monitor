import React, { useState, useMemo, useEffect } from 'react';
import { CSVUploader } from './CSVUploader';
import { DashboardStats } from './DashboardStats';
import { ModelFrequencyChart } from './charts/ModelFrequencyChart';
import { CumulativeEnergyChart } from './charts/CumulativeEnergyChart';
import { CorrelationCharts } from './charts/CorrelationCharts';
import { AdditionalCharts } from './charts/AdditionalCharts';
import { MonitoringData, DashboardStats as StatsType } from '@/types/dashboard';
import { generateSampleData } from '@/utils/sampleData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Zap, Brain, Network } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<MonitoringData[]>([]);

  // Load sample data on mount for demo
  useEffect(() => {
    setData(generateSampleData());
  }, []);

  const stats: StatsType = useMemo(() => {
    if (data.length === 0) {
    return {
      totalModels: 0,
      totalDataPoints: 0,
      totalEnergyUsage: 0,
      avgConfidence: 0,
      avgInferenceTime: 0,
    };
    }

    const uniqueModels = new Set(data.map(item => item.ModelName)).size;
    const totalEnergyUsage = data.reduce((sum, item) => sum + item.EnergyUsage, 0);
    const totalConfidence = data.reduce((sum, item) => sum + item.MeanConfidence, 0);
    const totalInferenceTime = data.reduce((sum, item) => sum + item.MeanInference, 0);

    return {
      totalModels: uniqueModels,
      totalDataPoints: data.length,
      totalEnergyUsage: totalEnergyUsage,
      avgConfidence: totalConfidence / data.length,
      avgInferenceTime: totalInferenceTime / data.length,
    };
  }, [data]);

  const handleDataLoad = (newData: MonitoringData[]) => {
    setData(newData);
  };

  return (
    <div className="dashboard-container">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-primary/20 to-chart-2/20 rounded-xl">
              <div className="flex items-center space-x-2">
                <Brain className="h-10 w-10 text-primary" />
                <Network className="h-8 w-8 text-chart-2" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                SAGE-ML
              </h1>
              <p className="text-lg font-medium text-muted-foreground">
                Self-Adaptive Model Switching Across the Edge–Cloud Continuum
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Real-time monitoring and analysis of adaptive model selection using MAPE-K feedback loops
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Demo</span>
              </span>
              <span>•</span>
              <span>Edge-Cloud Optimization</span>
              <span>•</span>
              <span>Energy-Aware Adaptation</span>
            </div>
          </div>
        </div>

        {data.length > 0 ? (
          <>
            {/* Stats Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>Overview Statistics</span>
              </h2>
              <DashboardStats stats={stats} />
            </div>

            {/* Main Charts Grid */}
            <div className="space-y-8">
              {/* Model Selection Frequency */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span>1. Model Selection Analysis</span>
                </h2>
                <ModelFrequencyChart data={data} />
              </div>

              {/* Cumulative Energy */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span>2. Energy Consumption Trends</span>
                </h2>
                <CumulativeEnergyChart data={data} />
              </div>

              {/* Correlation Analysis */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span>3. & 4. Correlation Analysis</span>
                </h2>
                <CorrelationCharts data={data} />
              </div>

              {/* Additional Insights */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span>5. Additional Insights</span>
                </h2>
                <AdditionalCharts data={data} />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <Card className="py-16">
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground">
                  Upload a CSV file to start analyzing your model monitoring data
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>Interactive dashboard for model performance analysis • Built with React & Recharts</p>
        </div>
      </div>
    </div>
  );
};