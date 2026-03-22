import mongoose from 'mongoose';
import { IDatabaseConnection } from '../../domain/interfaces/IDatabaseConnection';
import dotenv from 'dotenv';

dotenv.config();

export class MongoDatabaseConnection implements IDatabaseConnection {
  private static instance: MongoDatabaseConnection;
  private readonly uri: string;

  private constructor() {
    this.uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/desktop-ai-assistant';
  }

  public static getInstance(): MongoDatabaseConnection {
    if (!MongoDatabaseConnection.instance) {
      MongoDatabaseConnection.instance = new MongoDatabaseConnection();
    }
    return MongoDatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        console.log('MongoDB is already connected.');
        return;
      }

      await mongoose.connect(this.uri);
      console.log(`Successfully connected to MongoDB at ${this.uri}`);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (mongoose.connection.readyState === 0) {
        return;
      }
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB.');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}
