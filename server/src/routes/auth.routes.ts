import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { User, toPublicUser } from '../models/User.js';
import {
  clearCookieOptions,
  cookieName,
  cookieOptions,
  signSession,
  verifyPassword
} from '../services/auth.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ApiError } from '../utils/api-error.js';

const loginSchema = z.object({
  email: z.string().trim().email('Ingresá un correo válido.'),
  password: z.string().min(1, 'Ingresá la contraseña.')
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Intentá de nuevo más tarde.' }
});

const router = Router();

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user || !user.active) {
      throw new ApiError(401, 'Correo o contraseña incorrectos.');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'Correo o contraseña incorrectos.');
    }

    const token = signSession({
      sub: String(user._id),
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });

    res.cookie(cookieName(), token, cookieOptions());
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(cookieName(), clearCookieOptions());
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user || !user.active) {
      throw new ApiError(401, 'Sesión inválida o usuario deshabilitado.');
    }
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;