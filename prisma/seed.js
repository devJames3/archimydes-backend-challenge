import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const prisma = new PrismaClient();

// Schema to validate .env values
const envSchema = z.object({
  SUPER_ADMIN_EMAIL: z.email({ message: 'Invalid SUPER_ADMIN_EMAIL format' }),
  SUPER_ADMIN_PASSWORD: z.string().min(8, { message: 'SUPER_ADMIN_PASSWORD must be at least 8 characters' }),
  HASH_SALT: z
    .string()
    .transform(val => Number(val))
    .refine(num => !isNaN(num) && num > 0, { message: 'HASH_SALT must be a valid positive number' })
    .optional()
});

async function main() {
  const parsedEnv = envSchema.parse(process.env);

  const email = parsedEnv.SUPER_ADMIN_EMAIL;
  const password = parsedEnv.SUPER_ADMIN_PASSWORD;
  const salt = parsedEnv.HASH_SALT || 10;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Super admin already exists, skipping...');
    return;
  }

  const hashed = await bcrypt.hash(password, salt);
  await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      password: hashed,
      role: 'SUPER_ADMIN'
    }
  });

  console.log('Super admin created:', email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
