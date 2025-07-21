import React from 'react';
import { CSVUploader } from '@/components/CSVUploader';
import { MonitoringData } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Upload as UploadIcon, Brain, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Upload: React.FC = () => {
  const navigate = useNavigate();

  const handleDataLoad = (data: MonitoringData[]) => {
    // Store data in localStorage for the dashboard to access
    localStorage.setItem('dashboardData', JSON.stringify(data));
    
    // Navigate to dashboard
    navigate('/');
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
                SAGE-ML
              </h1>
              <p className="text-lg font-medium text-muted-foreground">
                Self-Adaptive Model Switching Across the Edge–Cloud Continuum
              </p>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-muted-foreground leading-relaxed">
              Upload your monitoring data to analyze adaptive model selection performance
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
              <UploadIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Upload CSV Data</h2>
              <p className="text-muted-foreground">
                Upload your model monitoring data to start the analysis
              </p>
            </div>
          </div>

          <CSVUploader onDataLoad={handleDataLoad} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>MAPE-K feedback loop analysis • Real-time model adaptation monitoring</p>
        </div>
      </div>
    </div>
  );
};

export default Upload;