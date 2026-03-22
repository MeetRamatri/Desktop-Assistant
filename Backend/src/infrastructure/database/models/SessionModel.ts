import mongoose, { Schema, Document } from 'mongoose';
export interface ISessionDocument extends Document {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}
const SessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = mongoose.model<ISessionDocument>('Session', SessionSchema);
