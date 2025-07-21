import { MonitoringData } from '@/types/dashboard';

export const generateSampleData = (): MonitoringData[] => {
  const models = ['MobileNet V1', 'EfficientDet Lite0', 'EfficientDet Lite1', 'EfficientDet Lite2'];
  const sampleData: MonitoringData[] = [];

  // Generate comprehensive sample data for demonstration
  for (let i = 0; i < 200; i++) {
    const modelName = models[Math.floor(Math.random() * models.length)];
    const baseTime = new Date('2024-12-18T17:53:05');
    const timestamp = new Date(baseTime.getTime() + (i * 2000 + Math.random() * 1000));
    
    // Generate realistic data based on model characteristics
    let batteryLevel = Math.max(20, 100 - (i * 0.3) + Math.random() * 8);
    let cpuUsage, batteryConsumption, confidence;
    
    switch (modelName) {
      case 'MobileNet V1':
        cpuUsage = Math.random() * 25 + 10; // 10-35%
        batteryConsumption = Math.random() * 3 + 2; // 2-5
        confidence = Math.random() * 40 + 20; // 20-60%
        break;
      case 'EfficientDet Lite0':
        cpuUsage = Math.random() * 20 + 15; // 15-35%
        batteryConsumption = Math.random() * 4 + 3; // 3-7
        confidence = Math.random() * 50 + 40; // 40-90%
        break;
      case 'EfficientDet Lite1':
        cpuUsage = Math.random() * 30 + 20; // 20-50%
        batteryConsumption = Math.random() * 6 + 4; // 4-10
        confidence = Math.random() * 45 + 50; // 50-95%
        break;
      case 'EfficientDet Lite2':
        cpuUsage = Math.random() * 40 + 30; // 30-70%
        batteryConsumption = Math.random() * 8 + 6; // 6-14
        confidence = Math.random() * 35 + 30; // 30-65%
        break;
      default:
        cpuUsage = Math.random() * 30 + 10;
        batteryConsumption = Math.random() * 5 + 2;
        confidence = Math.random() * 60 + 20;
    }

    const totalPredictions = Math.floor(Math.random() * 15) + i;
    const avgConfidence = confidence * (0.85 + Math.random() * 0.3); // Slightly different from instantaneous

    sampleData.push({
      Timestamp: timestamp.toISOString().slice(0, 19).replace('T', ' '),
      BatteryLevel: Number(batteryLevel.toFixed(0)),
      CPUUsage: Number(cpuUsage.toFixed(1)),
      BatteryConsumption: Number(batteryConsumption.toFixed(2)),
      SelectedModel: modelName,
      InstantaneousConfidence: Number(confidence.toFixed(5)),
      AverageConfidence: Number(avgConfidence.toFixed(5)),
      CurrentTotalPredictions: totalPredictions,
      InferenceTime: i > 0 ? Math.random() * 3 + 0.5 : 0, // 0.5-3.5 seconds
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