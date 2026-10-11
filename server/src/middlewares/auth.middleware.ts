import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../models/User.js';
import { cookieName, verifySession } from '../services/auth.service.js';
import { ApiError } from '../utils/api-error.js';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[cookieName()];
  if (!token) {
    next(new ApiError(401, 'No autenticado.'));
    return;
  }
  try {
    const payload = verifySession(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role
    };
    next();
  } catch {
    next(new ApiError(401, 'Sesión inválida o expirada.'));
  }
}