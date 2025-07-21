export interface LLMData {
  ModelId: string;
  ModelName: string;
  BatteryLevel: number;
  CPUUsage: number;
  Temperature: number;
  BatteryConsumption: number;
  UserFeedback: number;
  EnergyUsage: number;
  InputTokenSize: number;
  OutputTokenSize: number;
  Timestamp: string;
  EWMAScore: number;
}

export interface LLMStats {
  totalModels: number;
  totalDataPoints: number;
  avgEnergyUsage: number;
  avgEWMAScore: number;
  avgInputTokenSize: number;
  avgOutputTokenSize: number;
  avgTemperature: number;
  totalEnergyConsumption: number;
}

export interface CorrelationData {
  x: number;
  y: number;
  model: string;
  id: number;
}

export interface BubbleData {
  x: number;
  y: number;
  z: number;
  model: string;
  color: string;
}