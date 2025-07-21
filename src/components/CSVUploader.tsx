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
      transform: (value, field) => {
        // Convert numeric fields
        if (typeof field === 'string' && ['ID', 'EnergyUsage', 'MeanConfidence', 'MeanInference', 'EnergyPerConfidence'].includes(field)) {
          const num = parseFloat(String(value));
          return isNaN(num) ? 0 : num;
        }
        return String(value).trim();
      },
      complete: (results) => {
        try {
          const data = results.data as MonitoringData[];
          
          // Validate required fields
          const requiredFields = ['ID', 'ModelName', 'EnergyUsage', 'MeanConfidence', 'MeanInference'];
          const sampleRow = data[0];
          
          if (!sampleRow || !requiredFields.every(field => field in sampleRow)) {
            throw new Error(`Missing required fields. Expected: ${requiredFields.join(', ')}`);
          }

          // Calculate EnergyPerConfidence if not provided
          const processedData = data.map(row => ({
            ...row,
            EnergyPerConfidence: row.EnergyPerConfidence || (row.EnergyUsage / Math.max(row.MeanConfidence, 0.001))
          }));

          onDataLoad(processedData);
          toast({
            title: "CSV loaded successfully!",
            description: `Processed ${processedData.length} rows of data.`,
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
            <li>• <span className="font-mono">ID</span> - Unique identifier</li>
            <li>• <span className="font-mono">ModelName</span> - Name of the model</li>
            <li>• <span className="font-mono">EnergyUsage</span> - Energy consumption</li>
            <li>• <span className="font-mono">MeanConfidence</span> - Average confidence score</li>
            <li>• <span className="font-mono">MeanInference</span> - Average inference time</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};