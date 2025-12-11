import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { loginSchema, validate } from '../utils/validation';

const router = Router();

// In-memory admin credentials (in production, use database)
// These should match env vars or seed data
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

// Store hashed password (will be computed on first use or from env)
let adminPasswordHash: string | null = process.env.ADMIN_PASSWORD_HASH || null;

// Compute password hash if not set
async function getAdminPasswordHash(): Promise<string> {
  if (adminPasswordHash) {
    return adminPasswordHash;
  }
  
  // Compute hash from password
  adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  return adminPasswordHash;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 format: password
 *                 example: ChangeMe123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *       500:
 *         description: Server error
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Check credentials
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get password hash
    const passwordHash = await getAdminPasswordHash();

    // Verify password
    const isValid = await bcrypt.compare(password, passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    // @ts-expect-error - jsonwebtoken accepts string for expiresIn at runtime
    const token = jwt.sign({ username }, secret, { expiresIn });

    res.json({ token });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

