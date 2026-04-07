import { IAIService } from '../../application/interfaces/IAIService';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService implements IAIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn("[GeminiService] Warning: GEMINI_API_KEY is not set in environment variables.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async sendTextPrompt(prompt: string): Promise<string> {
    console.log(`[GeminiService] Dispatched prompt natively to gemini-2.5-flash: "${prompt}"`);
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("[GeminiService] Error calling Gemini API:", error);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }
}
