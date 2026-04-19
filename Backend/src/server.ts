import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
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

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            process.env.FRONTEND_URL // We will use this when frontend is deployed
        ].filter(Boolean);

        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
