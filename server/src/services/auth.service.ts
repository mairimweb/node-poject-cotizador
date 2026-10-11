import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import { env } from '../config/env.js';
import type { Role } from '../models/User.js';

const TOKEN_COOKIE = 'cv_token';
export const SESSION_TTL_DAYS = 7;

export function cookieName(): string {
  return TOKEN_COOKIE;
}

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  sub: string;
  email: string;
  displayName: string;
  role: Role;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, env.SESSION_SECRET, {
    expiresIn: `${SESSION_TTL_DAYS}d`
  });
}

export function verifySession(token: string): SessionPayload {
  const decoded = jwt.verify(token, env.SESSION_SECRET);
  if (typeof decoded === 'string' || !decoded.sub || !decoded.email || !decoded.role) {
    throw new Error('Token de sesión inválido.');
  }
  return decoded as SessionPayload;
}

export function cookieOptions(): CookieOptions {
  const maxAgeMs = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs
  };
}

export function clearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };
}