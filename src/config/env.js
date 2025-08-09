import dotenv from 'dotenv';
dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET', 'SUPER_ADMIN_EMAIL', 'SUPER_ADMIN_PASSWORD'];
for (const k of required) {
  if (!process.env[k]) {
    throw new Error(`Missing required env var: ${k}`);
  }
}

export const PORT = process.env.PORT || '3000';
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
export const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
export const NODE_ENV = process.env.NODE_ENV || 'development';