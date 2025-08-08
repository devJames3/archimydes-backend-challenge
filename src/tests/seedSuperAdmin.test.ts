// src/tests/seedSuperAdmin.test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' }); // must be first

import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { main as runSeed } from '../../prisma/seed'; // because seed exports main
import { email } from 'zod';
const prisma = new PrismaClient();

console.log({email: process.env.SUPER_ADMIN_EMAIL});

describe('Super Admin seeding (SQLite)', () => {
  const email = process.env.SUPER_ADMIN_EMAIL;

  beforeAll(async () => {
    // ensure DB ready; optionally run prisma db push earlier instead
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a super admin on fresh DB', async () => {
    let user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBeNull();

    await runSeed();

    user = await prisma.user.findUnique({ where: { email } });
    expect(user).not.toBeNull();
    expect(user?.role).toBe('SUPER_ADMIN');
  });

  it('is idempotent (no duplicate super admin)', async () => {
    const before = await prisma.user.count({ where: { email } });
    await runSeed();
    const after = await prisma.user.count({ where: { email } });
    expect(after).toBe(before);
  });
});
