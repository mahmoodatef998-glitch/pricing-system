import { Router, Request, Response } from 'express';
import { match, MatchCriteria } from '../services/matchService';
import { logger } from '../utils/logger';
import { matchProductSchema, validate } from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/match:
 *   post:
 *     summary: Match product by specifications
 *     description: Public endpoint to find matching products based on exact criteria
 *     tags: [Match]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchCriteria'
 *     responses:
 *       200:
 *         description: Match result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchResult'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */
router.post('/', validate(matchProductSchema), async (req: Request, res: Response) => {
  try {
    // Data is already validated and trimmed by zod schema
    const criteria: MatchCriteria = {
      description: req.body.description,
      size: req.body.size,
      breakers: req.body.breakers,
      brand: req.body.brand,
      ipEnclosure: req.body.ipEnclosure || undefined,
      pole: req.body.pole || undefined,
    };

    const result = await match(criteria);
    res.json(result);
  } catch (error) {
    logger.error('Match endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

