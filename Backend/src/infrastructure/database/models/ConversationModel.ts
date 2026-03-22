import mongoose, { Schema, Document } from 'mongoose';
export interface IMessageDocument extends Document {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
export interface IConversationDocument extends Document {
  userId: string;
  messages: IMessageDocument[];
  createdAt: Date;
}
const MessageSchema: Schema = new Schema(
  {
    sender: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
  },
  { _id: true }
);
const ConversationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    messages: [MessageSchema]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const ConversationModel = mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
