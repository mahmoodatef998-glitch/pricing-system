import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { getAnalytics } from '../services/analyticsService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/analytics:
 *   get:
 *     summary: Get analytics data (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: integer
 *                 totalDrawings:
 *                   type: integer
 *                 productsByBrand:
 *                   type: array
 *                 productsByDescription:
 *                   type: array
 *                 productsByBreakers:
 *                   type: array
 *                 recentProducts:
 *                   type: integer
 *                 averageDrawingsPerProduct:
 *                   type: number
 *                 topBrands:
 *                   type: array
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;


