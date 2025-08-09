import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import pkg from '@prisma/client';


import { validate } from '../middleware/validate.js';
import { createUserSchema } from '../validations/user.js';

const { Role } = pkg;

const router = Router();
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (role = USER)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       description: User registration data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Registered successfully (returns token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         description: Validation or email exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */

// Register: only for normal users
router.post('/register', validate(createUserSchema), async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email already in use' }
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: Role.USER }
    });

    const token = signToken({ id: user.id, role: user.role }, '1h');
    res.json({
      success: true,
      data: { token }
    });
  } catch (err) {
    next(err);
  }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200:
 *         description: Login successful (returns token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }

    const token = signToken({ id: user.id, role: user.role }, '1h');
    res.json({
      success: true,
      data: { token }
    });
  } catch (err) {
    next(err);
  }
});

export default router;