import { MonitoringData } from '@/types/dashboard';

export const generateSampleData = (): MonitoringData[] => {
  const models = ['GPT-4', 'Claude-3', 'Gemini-Pro', 'LLaMA-2', 'PaLM-2'];
  const sampleData: MonitoringData[] = [];

  for (let i = 1; i <= 100; i++) {
    const modelName = models[Math.floor(Math.random() * models.length)];
    
    // Generate realistic data with some correlation patterns
    const baseEnergy = Math.random() * 0.5 + 0.1; // 0.1 to 0.6
    const baseConfidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
    const baseInference = Math.random() * 50 + 10; // 10 to 60ms
    
    // Add some model-specific characteristics
    let energyMultiplier = 1;
    let confidenceMultiplier = 1;
    let inferenceMultiplier = 1;
    
    switch (modelName) {
      case 'GPT-4':
        energyMultiplier = 1.3;
        confidenceMultiplier = 1.1;
        inferenceMultiplier = 1.2;
        break;
      case 'Claude-3':
        energyMultiplier = 1.1;
        confidenceMultiplier = 1.05;
        inferenceMultiplier = 0.9;
        break;
      case 'Gemini-Pro':
        energyMultiplier = 0.9;
        confidenceMultiplier = 0.95;
        inferenceMultiplier = 1.1;
        break;
      case 'LLaMA-2':
        energyMultiplier = 0.8;
        confidenceMultiplier = 0.9;
        inferenceMultiplier = 0.8;
        break;
      case 'PaLM-2':
        energyMultiplier = 1.0;
        confidenceMultiplier = 1.0;
        inferenceMultiplier = 1.0;
        break;
    }

    const energyUsage = baseEnergy * energyMultiplier;
    const meanConfidence = Math.min(baseConfidence * confidenceMultiplier, 1.0);
    const meanInference = baseInference * inferenceMultiplier;

    sampleData.push({
      ID: i,
      ModelName: modelName,
      EnergyUsage: Number(energyUsage.toFixed(4)),
      MeanConfidence: Number(meanConfidence.toFixed(4)),
      MeanInference: Number(meanInference.toFixed(2)),
      EnergyPerConfidence: Number((energyUsage / meanConfidence).toFixed(4))
    });
  }

  return sampleData;
};

export const sampleCSVContent = `ID,ModelName,EnergyUsage,MeanConfidence,MeanInference
1,GPT-4,0.4231,0.8912,45.23
2,Claude-3,0.3821,0.9123,38.91
3,Gemini-Pro,0.2891,0.8634,42.15
4,LLaMA-2,0.2134,0.7892,31.76
5,PaLM-2,0.3456,0.8456,39.82
6,GPT-4,0.4512,0.9034,47.91
7,Claude-3,0.3623,0.8987,36.45
8,Gemini-Pro,0.2765,0.8234,41.23
9,LLaMA-2,0.1987,0.7645,29.87
10,PaLM-2,0.3289,0.8234,38.56`;