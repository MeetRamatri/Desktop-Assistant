import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
