import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });


import { PrismaClient } from '@prisma/client';

import { main as runSeed } from '../../prisma/seed.js';

const prisma = new PrismaClient();

describe('Super Admin seeding (SQLite)', () => { 
  const email = process.env.SUPER_ADMIN_EMAIL;
  beforeAll(async () => {
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
