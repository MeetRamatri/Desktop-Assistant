import express, { Application, Request, Response } from 'express';
import { MongoDatabaseConnection } from './infrastructure/database/MongoDatabaseConnection';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

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
