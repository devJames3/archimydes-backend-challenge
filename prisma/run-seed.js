import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';


const prisma = new PrismaClient();

const envSchema = z.object({
  SUPER_ADMIN_EMAIL: z.email(),
  SUPER_ADMIN_PASSWORD: z.string().min(8),
  HASH_SALT: z.string().optional()
});

export async function main() {
  const parsedEnv = envSchema.parse(process.env);

  const email = parsedEnv.SUPER_ADMIN_EMAIL;
  const password = parsedEnv.SUPER_ADMIN_PASSWORD;
  const salt = parseInt(parsedEnv.HASH_SALT || '10', 10);

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
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });