export interface MonitoringData {
  ID: number;
  ModelName: string;
  EnergyUsage: number;
  MeanConfidence: number;
  MeanInference: number;
  EnergyPerConfidence?: number;
  Timestamp?: string;
}

export interface DashboardStats {
  totalModels: number;
  totalDataPoints: number;
  totalEnergyUsage: number;
  avgConfidence: number;
  avgInferenceTime: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CorrelationData {
  x: number;
  y: number;
  model: string;
  id: number;
}