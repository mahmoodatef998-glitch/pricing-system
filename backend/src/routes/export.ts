import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { exportToExcel, exportToPDF } from '../utils/exportService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/export/excel:
 *   get:
 *     summary: Export products to Excel (Admin only)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/excel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      brand: req.query.brand as string | undefined,
      description: req.query.description as string | undefined,
    };

    // Get product IDs from query (comma-separated)
    const productIds = req.query.ids 
      ? (req.query.ids as string).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;

    const workbook = await exportToExcel(filters, productIds);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=products_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    logger.error('Export to Excel error:', error);
    res.status(500).json({ error: 'Failed to export products' });
  }
});

/**
 * @swagger
 * /api/export/pdf:
 *   get:
 *     summary: Export products to PDF (Admin only)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/pdf', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      brand: req.query.brand as string | undefined,
      description: req.query.description as string | undefined,
    };

    // Get product IDs from query (comma-separated)
    const productIds = req.query.ids 
      ? (req.query.ids as string).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : undefined;

    const pdfBuffer = await exportToPDF(filters, productIds);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=products_${new Date().toISOString().split('T')[0]}.pdf`
    );

    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Export to PDF error:', error);
    res.status(500).json({ error: 'Failed to export products' });
  }
});

export default router;


