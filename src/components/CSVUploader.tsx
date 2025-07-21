import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { MonitoringData } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onDataLoad: (data: MonitoringData[]) => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onDataLoad }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processCSV = useCallback((file: File) => {
    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          // Sort data by timestamp first
          const sortedData = (results.data as any[]).sort((a: any, b: any) => 
            new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime()
          );
          
          // Calculate inference time as difference between consecutive timestamps
          const transformedData: MonitoringData[] = sortedData.map((row: any, index: number) => {
            let inferenceTime = 0;
            if (index > 0) {
              const currentTime = new Date(row.Timestamp).getTime();
              const previousTime = new Date(sortedData[index - 1].Timestamp).getTime();
              inferenceTime = (currentTime - previousTime) / 1000; // Convert to seconds
            }
            
            return {
              Timestamp: String(row.Timestamp || new Date().toISOString()),
              BatteryLevel: parseFloat(row.BatteryLevel) || 0,
              CPUUsage: parseFloat(row.CPUUsage) || 0,
              BatteryConsumption: parseFloat(row.BatteryConsumption) || 0,
              SelectedModel: String(row.SelectedModel || ''),
              InstantaneousConfidence: parseFloat(row.InstantaneousConfidence) || 0,
              AverageConfidence: parseFloat(row.AverageConfidence) || 0,
              CurrentTotalPredictions: parseFloat(row.CurrentTotalPredictions) || 0,
              InferenceTime: inferenceTime,
            };
          });

          // Validate required fields
          const requiredFields = ['Timestamp', 'BatteryLevel', 'CPUUsage', 'BatteryConsumption', 'SelectedModel', 'InstantaneousConfidence'];
          const sampleRow = transformedData[0];
          
          if (!sampleRow || !requiredFields.every(field => field in sampleRow)) {
            throw new Error(`Missing required fields. Expected: ${requiredFields.join(', ')}`);
          }

          onDataLoad(transformedData);
          toast({
            title: "CSV loaded successfully!",
            description: `Processed ${transformedData.length} rows of data.`,
          });
        } catch (error) {
          toast({
            title: "Error processing CSV",
            description: error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        toast({
          title: "Error reading CSV",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    });
  }, [onDataLoad, toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      processCSV(file);
    }
  }, [processCSV]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const removeFile = () => {
    setFile(null);
    onDataLoad([]);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload CSV Data</h3>
          {file && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeFile}
              disabled={isProcessing}
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {!file ? (
          <div
            {...getRootProps()}
            className={`upload-area cursor-pointer ${isDragActive ? 'dragover' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop your CSV file here' : 'Upload your CSV file'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to browse
              </p>
              <Button variant="outline">Browse Files</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-4 bg-accent rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {isProcessing && (
              <div className="text-sm text-muted-foreground">Processing...</div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Expected CSV format:</p>
          <ul className="space-y-1 text-xs">
            <li>• <span className="font-mono">Timestamp</span> - Time of measurement</li>
            <li>• <span className="font-mono">BatteryLevel</span> - Battery percentage</li>
            <li>• <span className="font-mono">CPUUsage</span> - CPU usage percentage</li>
            <li>• <span className="font-mono">BatteryConsumption</span> - Battery consumption</li>
            <li>• <span className="font-mono">SelectedModel</span> - Name of selected model</li>
            <li>• <span className="font-mono">InstantaneousConfidence</span> - Confidence score</li>
            <li>• <span className="font-mono">AverageConfidence</span> - Average confidence</li>
            <li>• <span className="font-mono">CurrentTotalPredictions</span> - Total predictions</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};