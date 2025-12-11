import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { getProductHistory, getAllHistory } from '../services/productHistoryService';
import { logger } from '../utils/logger';
import { z } from 'zod';

const router = Router();

const historyQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * @swagger
 * /api/history:
 *   get:
 *     summary: Get product history (Admin only)
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: History data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, page, limit } = historyQuerySchema.parse(req.query);

    if (productId) {
      // Get history for specific product
      const history = await getProductHistory(productId);
      res.json({ history });
    } else {
      // Get all history with pagination
      const result = await getAllHistory(page || 1, limit || 50);
      res.json(result);
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }
    logger.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;


