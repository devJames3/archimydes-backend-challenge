import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
});
