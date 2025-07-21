import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { LLMData } from '@/types/llm';
import { useToast } from '@/hooks/use-toast';

interface LLMCSVUploaderProps {
  onDataLoad: (data: LLMData[]) => void;
}

export const LLMCSVUploader: React.FC<LLMCSVUploaderProps> = ({ onDataLoad }) => {
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
          const transformedData: LLMData[] = (results.data as any[]).map((row: any) => {
            return {
              ModelId: String(row.ModelId || ''),
              ModelName: String(row.ModelName || ''),
              BatteryLevel: parseFloat(row.BatteryLevel) || 0,
              CPUUsage: parseFloat(row.CPUUsage) || 0,
              Temperature: parseFloat(row.Temperature) || 0,
              BatteryConsumption: parseFloat(row.BatteryConsumption) || 0,
              UserFeedback: parseFloat(row.UserFeedback) || 0,
              EnergyUsage: parseFloat(row.EnergyUsage) || 0,
              InputTokenSize: parseFloat(row.InputTokenSize) || 0,
              OutputTokenSize: parseFloat(row.OutputTokenSize) || 0,
              Timestamp: String(row.Timestamp || new Date().toISOString()),
              EWMAScore: parseFloat(row.EWMAScore) || 0,
            };
          });

          // Validate required fields
          const requiredFields = ['ModelId', 'ModelName', 'BatteryLevel', 'CPUUsage', 'EnergyUsage', 'EWMAScore'];
          const sampleRow = transformedData[0];
          
          if (!sampleRow || !requiredFields.every(field => field in sampleRow)) {
            throw new Error(`Missing required fields. Expected: ${requiredFields.join(', ')}`);
          }

          onDataLoad(transformedData);
          toast({
            title: "LLM CSV loaded successfully!",
            description: `Processed ${transformedData.length} rows of data.`,
          });
        } catch (error) {
          toast({
            title: "Error processing LLM CSV",
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
          <h3 className="text-lg font-semibold">Upload LLM CSV Data</h3>
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
                {isDragActive ? 'Drop your LLM CSV file here' : 'Upload your LLM CSV file'}
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
          <p className="font-medium mb-2">Expected LLM CSV format:</p>
          <ul className="space-y-1 text-xs">
            <li>• <span className="font-mono">ModelId</span> - Model identifier</li>
            <li>• <span className="font-mono">ModelName</span> - Model display name</li>
            <li>• <span className="font-mono">BatteryLevel</span> - Battery percentage (0-1)</li>
            <li>• <span className="font-mono">CPUUsage</span> - CPU usage (0-1)</li>
            <li>• <span className="font-mono">Temperature</span> - Device temperature</li>
            <li>• <span className="font-mono">BatteryConsumption</span> - Battery consumption</li>
            <li>• <span className="font-mono">UserFeedback</span> - User feedback score</li>
            <li>• <span className="font-mono">EnergyUsage</span> - Energy usage</li>
            <li>• <span className="font-mono">InputTokenSize</span> - Input token count</li>
            <li>• <span className="font-mono">OutputTokenSize</span> - Output token count</li>
            <li>• <span className="font-mono">Timestamp</span> - Timestamp</li>
            <li>• <span className="font-mono">EWMAScore</span> - EWMA Score (BERT score)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};