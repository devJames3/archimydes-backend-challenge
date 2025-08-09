// src/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.mts';
import { signToken } from '../utils/jwt.mts';
import { Role } from '@prisma/client';

const router = Router();

// Register: only for normal users
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: Role.USER }
    });

    const token = signToken({ id: user.id, role: user.role }, '1h');
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ id: user.id, role: user.role }, '1h');
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
