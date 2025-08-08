import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { email } from 'zod';
dotenv.config();

const prisma = new PrismaClient();

// console.log({email: process.env.SUPER_ADMIN_EMAIL, password: process.env.SUPER_ADMIN_PASSWORD, salt: process.env.HASH_SALT});

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const salt = Number(process.env.HASH_SALT) || 10;

  if (!email || !password) {
    console.error('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping seed...');
    return;
  }

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
      role: "SUPER_ADMIN"
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