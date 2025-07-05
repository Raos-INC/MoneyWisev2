
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SALT_ROUNDS = 12;

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: { id: number; email: string; name: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token akses diperlukan' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }

  // Verify user still exists in database
  const user = await db.select()
    .from(users)
    .where(eq(users.id, decoded.id))
    .limit(1);

  if (user.length === 0) {
    return res.status(403).json({ message: 'User tidak ditemukan' });
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  };

  next();
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password);
  
  const result = await db.insert(users)
    .values({
      email,
      password: hashedPassword,
      name,
    });

  // MySQL doesn't support RETURNING, so we need to fetch the created user
  const insertId = result[0].insertId;
  const createdUser = await db.select()
    .from(users)
    .where(eq(users.id, insertId))
    .limit(1);

  return createdUser[0];
}

export async function findUserByEmail(email: string) {
  const result = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
