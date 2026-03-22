import { IAIService } from '../../application/interfaces/IAIService';
export class GeminiService implements IAIService {
  async sendTextPrompt(prompt: string): Promise<string> {
    console.log(`[GeminiService] Dispatched prompt natively: "${prompt}"`);
    await new Promise(resolve => setTimeout(resolve, 800));
    return `Simulated generic AI response acknowledging: ${prompt}`;
  }
}
