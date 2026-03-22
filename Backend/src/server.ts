import express, { Application, Request, Response } from 'express';
import { MongoDatabaseConnection } from './infrastructure/database/MongoDatabaseConnection';

// Clean Architecture Dependency Graph - Auth
import { MongoUserRepository } from './infrastructure/repositories/MongoUserRepository';
import { MongoSessionRepository } from './infrastructure/repositories/MongoSessionRepository';
import { BcryptPasswordHasher } from './infrastructure/security/BcryptPasswordHasher';
import { AuthService } from './application/services/AuthService';
import { AuthController } from './presentation/controllers/AuthController';
import { createAuthRoutes } from './presentation/routes/AuthRoutes';
import { MongoConversationRepository } from './infrastructure/repositories/MongoConversationRepository';
import { GeminiService } from './infrastructure/ai/GeminiService';
import { ChatService } from './application/services/ChatService';
import { ChatController } from './presentation/controllers/ChatController';
import { createChatRoutes } from './presentation/routes/ChatRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
const userRepository = new MongoUserRepository();
const sessionRepository = new MongoSessionRepository();
const passwordHasher = new BcryptPasswordHasher();
const authService = new AuthService(userRepository, sessionRepository, passwordHasher);
const authController = new AuthController(authService);
const authRoutes = createAuthRoutes(authController);
const conversationRepository = new MongoConversationRepository();
const aiService = new GeminiService();
const chatService = new ChatService(conversationRepository, aiService);
const chatController = new ChatController(chatService);
const chatRoutes = createChatRoutes(chatController);

app.use('/api/users', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('API is running! 🚀');
});

MongoDatabaseConnection.getInstance().connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database. Server failed to start.', error);
    process.exit(1);
});
