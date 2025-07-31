import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'exchange-office-secret-key';
const SALT_ROUNDS = 12;

export interface AuthenticatedRequest extends Request {
  clientId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(clientId: string): string {
  return jwt.sign({ clientId }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { clientId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { clientId: string };
    return decoded;
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.clientId = decoded.clientId;
  next();
}
