import { Request, Response } from 'express';
import { ChatService } from '../../application/services/ChatService';

export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  public sendPrompt = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, promptText, prompt, conversationId } = req.body;
      const actualPrompt = promptText || prompt;

      if (!actualPrompt) {
        res.status(400).json({ error: "Missing 'promptText' or 'prompt' in request body" });
        return;
      }

      if (!userId) {
        res.status(400).json({ error: "Missing 'userId' in request body" });
        return;
      }

      const { conversation, aiResponse } = await this.chatService.sendPrompt(userId, actualPrompt, conversationId);

      res.status(200).json({ conversationId: conversation.conversationId, aiResponse });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  public getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const history = await this.chatService.getChatHistory(userId as string);
      res.status(200).json({ history });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
