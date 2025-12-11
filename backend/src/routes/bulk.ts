import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'At least one ID is required'),
});

const bulkUpdateSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'At least one ID is required'),
  data: z.object({
    brand: z.string().optional(),
    description: z.string().optional(),
    price: z.string().optional().nullable(),
  }),
});

/**
 * @swagger
 * /api/bulk/delete:
 *   post:
 *     summary: Delete multiple products (Admin only)
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Products deleted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/delete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = bulkDeleteSchema.parse(req.body);

    const deleted = await prisma.product.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    logger.info(`Bulk delete: ${deleted.count} products deleted by ${req.user?.username}`);

    res.json({
      success: true,
      deleted: deleted.count,
      message: `Successfully deleted ${deleted.count} product(s)`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }
    logger.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

/**
 * @swagger
 * /api/bulk/update:
 *   post:
 *     summary: Update multiple products (Admin only)
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - data
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               data:
 *                 type: object
 *                 properties:
 *                   brand:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: string
 *     responses:
 *       200:
 *         description: Products updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/update', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { ids, data } = bulkUpdateSchema.parse(req.body);

    const updateData: any = {};
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price || null;

    const updated = await prisma.product.updateMany({
      where: {
        id: { in: ids },
      },
      data: updateData,
    });

    logger.info(`Bulk update: ${updated.count} products updated by ${req.user?.username}`);

    res.json({
      success: true,
      updated: updated.count,
      message: `Successfully updated ${updated.count} product(s)`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    }
    logger.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update products' });
  }
});

export default router;


