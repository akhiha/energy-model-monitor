import React, { useState, useMemo, useEffect } from 'react';
import { DashboardStats } from './DashboardStats';
import { ModelFrequencyChart } from './charts/ModelFrequencyChart';
import { CumulativeCPUChart } from './charts/CumulativeCPUChart';
import { CumulativeBatteryChart } from './charts/CumulativeBatteryChart';
import { CorrelationCharts } from './charts/CorrelationCharts';
import { EfficiencyCharts } from './charts/EfficiencyCharts';
import { MonitoringData, DashboardStats as StatsType } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Zap, Brain, Network, Upload, Cpu, Battery } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<MonitoringData[]>([]);

  // Load data from localStorage if available
  useEffect(() => {
    const storedData = localStorage.getItem('dashboardData');
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, []);

  const stats: StatsType = useMemo(() => {
    if (data.length === 0) {
      return {
        totalModels: 0,
        totalDataPoints: 0,
        totalCPUUsage: 0,
        totalBatteryConsumption: 0,
        avgInstantaneousConfidence: 0,
        maxInstantaneousConfidence: 0,
        avgBatteryLevel: 0,
        totalPredictions: 0,
      };
    }

    const uniqueModels = new Set(data.map(item => item.SelectedModel)).size;
    const totalCPUUsage = data.reduce((sum, item) => sum + item.CPUUsage, 0);
    
    // Calculate battery consumption as difference between first and last battery levels
    const sortedByTime = [...data].sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());
    const firstBatteryLevel = sortedByTime[0]?.BatteryLevel || 0;
    const lastBatteryLevel = sortedByTime[sortedByTime.length - 1]?.BatteryLevel || 0;
    const totalBatteryConsumption = firstBatteryLevel - lastBatteryLevel;
    
    const totalInstantaneousConfidence = data.reduce((sum, item) => sum + item.InstantaneousConfidence, 0);
    const maxInstantaneousConfidence = Math.max(...data.map(item => item.InstantaneousConfidence));
    const totalBatteryLevel = data.reduce((sum, item) => sum + item.BatteryLevel, 0);
    const totalPredictions = data.reduce((sum, item) => sum + item.CurrentTotalPredictions, 0);

    return {
      totalModels: uniqueModels,
      totalDataPoints: data.length,
      totalCPUUsage: totalCPUUsage,
      totalBatteryConsumption: totalBatteryConsumption,
      avgInstantaneousConfidence: totalInstantaneousConfidence / data.length,
      maxInstantaneousConfidence: maxInstantaneousConfidence,
      avgBatteryLevel: totalBatteryLevel / data.length,
      totalPredictions: totalPredictions,
    };
  }, [data]);

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

              {/* Cumulative Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center space-x-2">
                    <Cpu className="h-6 w-6 text-primary" />
                    <span>2. Cumulative CPU Usage</span>
                  </h2>
                  <CumulativeCPUChart data={data} />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center space-x-2">
                    <Battery className="h-6 w-6 text-primary" />
                    <span>3. Cumulative Battery Consumption</span>
                  </h2>
                  <CumulativeBatteryChart data={data} />
                </div>
              </div>

              {/* Correlation Analysis */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span>4. Correlation Analysis</span>
                </h2>
                <CorrelationCharts data={data} />
              </div>

              {/* Efficiency Analysis */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span>5. Efficiency Analysis</span>
                </h2>
                <EfficiencyCharts data={data} />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <Card className="py-16">
            <CardContent className="text-center space-y-6">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
                <Upload className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your CSV monitoring data to start analyzing model performance
                </p>
                <Link 
                  to="/upload" 
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t space-y-2">
          <p>Interactive dashboard for model performance analysis • Built with React & Recharts</p>
          <p>
            <strong>Reference:</strong> Akhila Matathammal and Dr. Karthik Vaidhyanathan, IIIT Hyderabad. 
            <a 
              href="https://doi.org/10.1109/ICSA-C65153.2025.00081" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-2"
            >
              EdgeMLBalancer - DOI: 10.1109/ICSA-C65153.2025.00081
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};