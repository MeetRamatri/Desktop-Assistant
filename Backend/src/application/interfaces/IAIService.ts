export interface IAIService {
  sendTextPrompt(prompt: string): Promise<string>;
}
