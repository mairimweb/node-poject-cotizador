import mongoose from 'mongoose';
import type { Model } from 'mongoose';
import type { EncryptedPayload } from '../utils/crypto.js';

const { Schema, model, models } = mongoose;

export const ROLES = ['admin', 'operator'] as const;
export type Role = (typeof ROLES)[number];

export interface UserAttrs {
  email: string;
  passwordHash: string;
  displayName: string;
  role: Role;
  active: boolean;
  sensitive: EncryptedPayload | null;
}

const userSchema = new Schema<UserAttrs>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    displayName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ROLES,
      required: true,
      default: 'operator'
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    },
    sensitive: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  { timestamps: true }
);

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export function toPublicUser(user: Pick<UserAttrs, 'email' | 'displayName' | 'role'> & { _id: unknown }): PublicUser {
  return {
    id: String(user._id),
    email: user.email,
    displayName: user.displayName,
    role: user.role
  };
}

export const User = (models.User as Model<UserAttrs> | undefined) ?? model<UserAttrs>('User', userSchema);