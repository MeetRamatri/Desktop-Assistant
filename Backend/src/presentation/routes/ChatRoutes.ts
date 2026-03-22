import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';

export const createChatRoutes = (chatController: ChatController): Router => {
  const router = Router();

  router.post('/prompt', chatController.sendPrompt);
  router.get('/history/:userId', chatController.getChatHistory);

  return router;
};
