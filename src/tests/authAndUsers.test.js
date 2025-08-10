import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { PrismaClient, Role } from '@prisma/client';
import app from '../app.js';

const prisma = new PrismaClient();

describe('Auth & Users routes', () => {
  let superAdminToken;
  let userToken;
  let createdUserId;

  beforeAll(async () => {
    // Clean DB before tests
    await prisma.user.deleteMany({});

    // Create Super Admin manually
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com',
        password: await bcrypt.hash('password123', 10),
        role: Role.SUPER_ADMIN
      }
    });

    // Login to get Super Admin token
    const res = await request(app)
      .post('/auth/login')
      .send({ email: superAdmin.email, password: 'password123' });
    superAdminToken = res.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'pass1234'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should login as the new user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'pass1234'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
  });

  it('Super Admin should list users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    createdUserId = res.body.data.find((u) => u.email === 'testuser@example.com').id;
  });

  it('User should get their own profile', async () => {
    const res = await request(app)
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test User');
  });

  it('User should update their own profile', async () => {
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('Super Admin should delete the user', async () => {
    const res = await request(app)
      .delete(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
  });
});
