import { MonitoringData } from '@/types/dashboard';

export const generateSampleData = (): MonitoringData[] => {
  const models = ['MobileNet V1', 'EfficientDet Lite0', 'EfficientDet Lite1', 'EfficientDet Lite2'];
  const sampleData: MonitoringData[] = [];

  // Generate sample data matching the new format
  for (let i = 0; i < 100; i++) {
    const modelName = models[Math.floor(Math.random() * models.length)];
    const baseTime = new Date('2024-12-18T17:53:05');
    const timestamp = new Date(baseTime.getTime() + (i * 1000 + Math.random() * 1000));
    
    // Generate realistic data based on model characteristics
    let batteryLevel = Math.max(10, 100 - (i * 0.4) + Math.random() * 5);
    let cpuUsage, batteryConsumption, confidence;
    
    switch (modelName) {
      case 'MobileNet V1':
        cpuUsage = Math.random() * 15 + 5; // 5-20%
        batteryConsumption = Math.random() * 2 + 1; // 1-3
        confidence = Math.random() * 30 + 10; // 10-40%
        break;
      case 'EfficientDet Lite0':
        cpuUsage = Math.random() * 10 + 3; // 3-13%
        batteryConsumption = Math.random() * 2.5 + 1.5; // 1.5-4
        confidence = Math.random() * 40 + 30; // 30-70%
        break;
      case 'EfficientDet Lite1':
        cpuUsage = Math.random() * 12 + 8; // 8-20%
        batteryConsumption = Math.random() * 3 + 2; // 2-5
        confidence = Math.random() * 35 + 40; // 40-75%
        break;
      case 'EfficientDet Lite2':
        cpuUsage = Math.random() * 20 + 15; // 15-35%
        batteryConsumption = Math.random() * 15 + 5; // 5-20
        confidence = Math.random() * 30 + 15; // 15-45%
        break;
      default:
        cpuUsage = Math.random() * 20 + 5;
        batteryConsumption = Math.random() * 5 + 1;
        confidence = Math.random() * 50 + 25;
    }

    const totalPredictions = Math.floor(Math.random() * 10) + i;
    const avgConfidence = confidence * (0.9 + Math.random() * 0.2); // Slightly different from instantaneous

    sampleData.push({
      Timestamp: timestamp.toISOString().slice(0, 19).replace('T', ' '),
      BatteryLevel: Number(batteryLevel.toFixed(0)),
      CPUUsage: Number(cpuUsage.toFixed(1)),
      BatteryConsumption: Number(batteryConsumption.toFixed(2)),
      SelectedModel: modelName,
      InstantaneousConfidence: Number(confidence.toFixed(5)),
      AverageConfidence: Number(avgConfidence.toFixed(5)),
      CurrentTotalPredictions: totalPredictions,
      InferenceTime: i > 0 ? Math.random() * 2 + 0.5 : 0, // 0.5-2.5 seconds
    });
  }

  return sampleData;
};

export const sampleCSVContent = `Timestamp,BatteryLevel,CPUUsage,BatteryConsumption,SelectedModel,InstantaneousConfidence,AverageConfidence,CurrentTotalPredictions
2024-12-18 17:53:05,58,12.0,1.74,MobileNet V1,0.0,0.0,0
2024-12-18 17:53:05,58,12.0,1.74,MobileNet V1,0.0,0.0,0
2024-12-18 17:53:06,58,4.0,1.74,EfficientDet Lite1,48.30729,47.61795,0
2024-12-18 17:53:06,58,4.0,1.74,EfficientDet Lite0,48.30729,47.61795,0
2024-12-18 17:53:08,58,19.0,12.18,EfficientDet Lite2,18.75,20.690104,0
2024-12-18 17:53:08,58,19.0,12.18,EfficientDet Lite2,18.75,20.690104,0`;