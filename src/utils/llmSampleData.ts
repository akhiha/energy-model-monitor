import { LLMData } from '@/types/llm';

export const generateLLMSampleData = (): LLMData[] => {
  const models = [
    { id: 'mobilebert-tflite', name: 'MobileBERT TFLite' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'llama-2-7b', name: 'Llama 2 7B' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];

  const data: LLMData[] = [];
  const baseTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

  for (let i = 0; i < 100; i++) {
    const model = models[Math.floor(Math.random() * models.length)];
    const timestamp = baseTime + (i * 15 * 60 * 1000); // 15 minutes apart
    
    const batteryLevel = Math.max(0.1, 1.0 - (i * 0.008) + (Math.random() - 0.5) * 0.1);
    const cpuUsage = Math.random() * 0.9 + 0.1;
    const temperature = 25 + Math.random() * 35;
    const energyUsage = cpuUsage * 0.8 + Math.random() * 0.3;
    const inputTokenSize = Math.floor(Math.random() * 10) + 1;
    const outputTokenSize = Math.floor(Math.random() * 500) + 10;
    const userFeedback = Math.floor(Math.random() * 5) + 1;
    const ewmaScore = Math.random() * 0.8 + 0.2;

    data.push({
      ModelId: model.id,
      ModelName: model.name,
      BatteryLevel: batteryLevel,
      CPUUsage: cpuUsage,
      Temperature: temperature,
      BatteryConsumption: i > 0 ? Math.random() * 0.05 : 0,
      UserFeedback: userFeedback,
      EnergyUsage: energyUsage,
      InputTokenSize: inputTokenSize,
      OutputTokenSize: outputTokenSize,
      Timestamp: timestamp.toString(),
      EWMAScore: ewmaScore
    });
  }

  return data;
};