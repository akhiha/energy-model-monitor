import React from 'react';
import { LLMCSVUploader } from '@/components/LLMCSVUploader';
import { LLMData } from '@/types/llm';
import { Card, CardContent } from '@/components/ui/card';
import { Upload as UploadIcon, Brain, Network } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const LLMUpload: React.FC = () => {
  const navigate = useNavigate();

  const handleDataLoad = (data: LLMData[]) => {
    // Store data in localStorage for the dashboard to access
    localStorage.setItem('llmDashboardData', JSON.stringify(data));
    
    // Navigate to LLM dashboard
    navigate('/llm');
  };

  return (
    <div className="min-h-screen bg-background">
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
              Upload your LLM monitoring data to analyze energy efficiency and token performance
            </p>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center space-x-4">
            <Link 
              to="/upload" 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              Upload CV Data
            </Link>
            <Link 
              to="/llm" 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              View LLM Dashboard
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
              <UploadIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Upload LLM CSV Data</h2>
              <p className="text-muted-foreground">
                Upload your LLM model monitoring data to start the analysis
              </p>
            </div>
          </div>

          <LLMCSVUploader onDataLoad={handleDataLoad} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>LLM performance analysis • Energy-aware model selection</p>
        </div>
      </div>
    </div>
  );
};

export default LLMUpload;