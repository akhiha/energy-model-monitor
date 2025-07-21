import { MonitoringData } from '@/types/dashboard';

export const generateSampleData = (): MonitoringData[] => {
  const models = ['EfficientNetB0', 'EfficientliteV2', 'MobileNetV3', 'ResNet50'];
  const sampleData: MonitoringData[] = [];

  // Your exact sample data format
  const exactData = [
    {ID: 1, ModelName: 'EfficientliteV2', EnergyUsage: 2.273, CPUUsage: 25.34, Confidence: 0.815},
    {ID: 2, ModelName: 'EfficientliteV2', EnergyUsage: 1.191, CPUUsage: 29.59, Confidence: 0.396},
    {ID: 3, ModelName: 'EfficientliteV2', EnergyUsage: 2.995, CPUUsage: 73.77, Confidence: 0.363},
    {ID: 4, ModelName: 'EfficientliteV2', EnergyUsage: 2.06, CPUUsage: 41.61, Confidence: 0.971},
    {ID: 5, ModelName: 'EfficientliteV2', EnergyUsage: 1.663, CPUUsage: 58.68, Confidence: 0.906},
  ];

  // Add your exact data first
  exactData.forEach(item => {
    sampleData.push({
      ID: item.ID,
      ModelName: item.ModelName,
      EnergyUsage: item.EnergyUsage,
      MeanConfidence: item.Confidence,
      MeanInference: Math.random() * 50 + 20, // Generate inference time
      CPUUsage: item.CPUUsage,
      EnergyPerConfidence: Number((item.EnergyUsage / item.Confidence).toFixed(4))
    });
  });

  // Generate additional data to reach 100 points with 4 models
  for (let i = 6; i <= 100; i++) {
    const modelName = models[Math.floor(Math.random() * models.length)];
    
    // Generate realistic data based on model characteristics
    let baseEnergy, baseConfidence;
    
    switch (modelName) {
      case 'EfficientliteV2':
        baseEnergy = Math.random() * 1.5 + 1.0; // 1.0 to 2.5
        baseConfidence = Math.random() * 0.6 + 0.3; // 0.3 to 0.9
        break;
      case 'EfficientNetB0':
        baseEnergy = Math.random() * 1.2 + 0.8; // 0.8 to 2.0
        baseConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
        break;
      case 'MobileNetV3':
        baseEnergy = Math.random() * 1.0 + 0.5; // 0.5 to 1.5
        baseConfidence = Math.random() * 0.5 + 0.4; // 0.4 to 0.9
        break;
      case 'ResNet50':
        baseEnergy = Math.random() * 2.0 + 1.5; // 1.5 to 3.5
        baseConfidence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
        break;
      default:
        baseEnergy = Math.random() * 1.5 + 1.0;
        baseConfidence = Math.random() * 0.5 + 0.5;
    }

    const meanInference = Math.random() * 50 + 20; // 20 to 70ms

    sampleData.push({
      ID: i,
      ModelName: modelName,
      EnergyUsage: Number(baseEnergy.toFixed(3)),
      MeanConfidence: Number(baseConfidence.toFixed(3)),
      MeanInference: Number(meanInference.toFixed(2)),
      CPUUsage: Math.random() * 60 + 20, // 20 to 80% CPU usage
      EnergyPerConfidence: Number((baseEnergy / baseConfidence).toFixed(4))
    });
  }

  return sampleData;
};

export const sampleCSVContent = `ID,ModelName,EnergyUsage,CPUUsage,Confidence
1,EfficientliteV2,2.273,25.34,0.815
2,EfficientliteV2,1.191,29.59,0.396
3,EfficientliteV2,2.995,73.77,0.363
4,EfficientliteV2,2.06,41.61,0.971
5,EfficientliteV2,1.663,58.68,0.906
6,EfficientNetB0,1.543,32.45,0.782
7,MobileNetV3,0.891,21.34,0.654
8,ResNet50,2.456,45.67,0.892
9,EfficientNetB0,1.234,28.91,0.743
10,MobileNetV3,1.098,24.56,0.598`;