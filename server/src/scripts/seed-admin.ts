import { connectDb, disconnectDb } from '../db/connect.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/auth.service.js';
import { encryptJson } from '../utils/crypto.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    logger.error(
      'Configurá ADMIN_EMAIL y ADMIN_PASSWORD en .env para crear el usuario administrador.'
    );
    process.exit(1);
  }

  await connectDb();

  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const displayName = env.ADMIN_NAME?.trim() || 'Administrador';
  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);

  const sensitive = encryptJson({
    activationCode: 'COTIX2026',
    proveedorEmail: 'elevatronix@gmail.com'
  });

  const existing = await User.findOneAndUpdate(
    { email },
    { $set: { displayName, role: 'admin', active: true, passwordHash, sensitive } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  logger.info(
    `Usuario admin listo: ${existing.email} (role=${existing.role}, id=${String(existing._id)}).`
  );

  await disconnectDb();
}

seedAdmin().catch((err) => {
  logger.error('Error creando admin:', err);
  process.exit(1);
});