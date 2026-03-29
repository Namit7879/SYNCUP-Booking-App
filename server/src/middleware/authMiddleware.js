import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../prismaClient.js';

const isNoLoginAdminEnabled = () => process.env.NO_LOGIN_ADMIN !== 'false';

let cachedDefaultUserId = null;

const resolveDefaultUserId = async () => {
  if (cachedDefaultUserId) return cachedDefaultUserId;

  const explicitUserId = process.env.DEFAULT_USER_ID;
  if (explicitUserId) {
    const user = await prisma.user.findUnique({ where: { id: explicitUserId }, select: { id: true } });
    if (user) {
      cachedDefaultUserId = user.id;
      return user.id;
    }
  }

  const fallbackEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@local.dev';
  const existingByEmail = await prisma.user.findUnique({ where: { email: fallbackEmail }, select: { id: true } });
  if (existingByEmail) {
    cachedDefaultUserId = existingByEmail.id;
    return existingByEmail.id;
  }

  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (firstUser) {
    cachedDefaultUserId = firstUser.id;
    return firstUser.id;
  }

  const fallbackPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
  const hashed = await bcrypt.hash(fallbackPassword, 12);
  const created = await prisma.user.create({
    data: {
      name: process.env.DEFAULT_ADMIN_NAME || 'Default Admin',
      email: fallbackEmail,
      password: hashed,
    },
    select: { id: true },
  });

  cachedDefaultUserId = created.id;
  return created.id;
};

const attachDefaultUser = async (req, res, next) => {
  if (!isNoLoginAdminEnabled()) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }

  try {
    req.userId = await resolveDefaultUserId();
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return attachDefaultUser(req, res, next);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return attachDefaultUser(req, res, next);
  }
};
