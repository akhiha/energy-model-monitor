export interface MonitoringData {
  Timestamp: string;
  BatteryLevel: number;
  CPUUsage: number;
  BatteryConsumption: number;
  SelectedModel: string;
  InstantaneousConfidence: number;
  AverageConfidence: number;
  CurrentTotalPredictions: number;
  InferenceTime?: number; // Calculated field
}

export interface DashboardStats {
  totalModels: number;
  totalDataPoints: number;
  totalCPUUsage: number;
  totalBatteryConsumption: number;
  avgInstantaneousConfidence: number;
  maxInstantaneousConfidence: number;
  avgBatteryLevel: number;
  totalPredictions: number;
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