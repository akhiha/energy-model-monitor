import React, { useState, useMemo, useEffect } from 'react';
import { LLMDashboardStats } from '@/components/LLMDashboardStats';
import { LLMModelFrequencyChart } from '@/components/llm-charts/LLMModelFrequencyChart';
import { LLMCorrelationCharts } from '@/components/llm-charts/LLMCorrelationCharts';
import { LLMCumulativeEnergyChart } from '@/components/llm-charts/LLMCumulativeEnergyChart';
import { LLMData, LLMStats } from '@/types/llm';
import { BarChart3, TrendingUp, Zap, Brain, Network, Upload, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateLLMSampleData } from '@/utils/llmSampleData';

export const LLMDashboard: React.FC = () => {
  const [data, setData] = useState<LLMData[]>([]);

  // Load data from localStorage if available, otherwise use sample data
  useEffect(() => {
    const storedData = localStorage.getItem('llmDashboardData');
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error parsing stored LLM data:', error);
        // Fallback to sample data if stored data is corrupted
        setData(generateLLMSampleData());
      }
    } else {
      // Use sample data as default
      setData(generateLLMSampleData());
    }
  }, []);

  const stats: LLMStats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalModels: 0,
        totalDataPoints: 0,
        avgEnergyUsage: 0,
        avgEWMAScore: 0,
        avgInputTokenSize: 0,
        avgOutputTokenSize: 0,
        avgTemperature: 0,
        totalEnergyConsumption: 0,
      };
    }

    const uniqueModels = new Set(data.map(item => item.ModelName)).size;
    const totalEnergyUsage = data.reduce((sum, item) => sum + item.EnergyUsage, 0);
    const totalEWMAScore = data.reduce((sum, item) => sum + item.EWMAScore, 0);
    const totalInputTokens = data.reduce((sum, item) => sum + item.InputTokenSize, 0);
    const totalOutputTokens = data.reduce((sum, item) => sum + item.OutputTokenSize, 0);
    const totalTemperature = data.reduce((sum, item) => sum + item.Temperature, 0);

    return {
      totalModels: uniqueModels,
      totalDataPoints: data.length,
      avgEnergyUsage: totalEnergyUsage / data.length,
      avgEWMAScore: totalEWMAScore / data.length,
      avgInputTokenSize: totalInputTokens / data.length,
      avgOutputTokenSize: totalOutputTokens / data.length,
      avgTemperature: totalTemperature / data.length,
      totalEnergyConsumption: totalEnergyUsage,
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
                SAGE-ML LLM
              </h1>
              <p className="text-lg font-medium text-muted-foreground">
                Large Language Model Performance Analysis
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Real-time monitoring and analysis of LLM model performance using energy efficiency metrics
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Demo</span>
              </span>
              <span>•</span>
              <span>Energy-Aware LLM Selection</span>
              <span>•</span>
              <span>Token Efficiency Analysis</span>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <Link 
              to="/" 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              CV Dashboard
            </Link>
            <Link 
              to="/llm-upload" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload LLM Data</span>
            </Link>
          </div>
        </div>

        {/* Always show dashboard since we now have sample data */}
        {data.length > 0 && (
          <>
            {/* Stats Overview */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>Overview Statistics</span>
              </h2>
              <LLMDashboardStats stats={stats} />
            </div>

            {/* Main Charts Grid */}
            <div className="space-y-8">
              {/* Model Selection Frequency */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span>1. Model Selection Analysis</span>
                </h2>
                <LLMModelFrequencyChart data={data} />
              </div>

              {/* Correlation Analysis */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <span>2. Correlation Analysis</span>
                </h2>
                <LLMCorrelationCharts data={data} />
              </div>

              {/* Cumulative Energy Usage */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-primary" />
                  <span>3. Cumulative Energy Usage</span>
                </h2>
                <LLMCumulativeEnergyChart data={data} />
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t space-y-2">
          <p>Interactive LLM dashboard for model performance analysis • Built with React & Recharts</p>
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