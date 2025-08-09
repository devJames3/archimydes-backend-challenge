import jwt, { Secret } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.mts';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export function signToken(payload: object, expiresIn: '1h') {
  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn });
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, JWT_SECRET as string) as T;
}
