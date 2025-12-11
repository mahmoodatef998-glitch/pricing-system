import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import { logger } from '../utils/logger';
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
  validate,
  validateQuery,
} from '../utils/validation';

const router = Router();

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many upload requests
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware,
  uploadLimiter,
  upload.array('files'),
  validate(createProductSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      const data = {
        description: req.body.description,
        size: req.body.size,
        breakers: req.body.breakers,
        brand: req.body.brand,
        ipEnclosure: req.body.ipEnclosure || undefined,
        pole: req.body.pole || undefined,
        price: req.body.price || undefined,
      };

      const product = await createProduct(data, files);
      res.status(201).json(product);
    } catch (error: any) {
      logger.error('Create product error:', error);
      if (error.message === 'DUPLICATE_PRODUCT') {
        res.status(409).json({ error: 'A product with these specifications already exists', code: 'DUPLICATE_PRODUCT' });
      } else {
        res.status(500).json({ error: error.message || 'Internal server error' });
      }
    }
  }
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with optional filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProducts'
 *       500:
 *         description: Server error
 */
router.get('/', validateQuery(productFiltersSchema), async (req: Request, res: Response) => {
  try {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      brand: req.query.brand as string | undefined,
      description: req.query.description as string | undefined,
      size: req.query.size as string | undefined,
      breakers: req.query.breakers as string | undefined,
      search: req.query.search as string | undefined, // General search across all fields
    };

    const result = await getProducts(filters);
    res.json(result);
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await getProductById(id);
    res.json(product);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               size:
 *                 type: string
 *               breakers:
 *                 type: string
 *               brand:
 *                 type: string
 *               ipEnclosure:
 *                 type: string
 *               pole:
 *                 type: string
 *               price:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       429:
 *         description: Too many upload requests
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware,
  uploadLimiter,
  upload.array('files'),
  validate(updateProductSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const files = req.files as Express.Multer.File[];
      const data: any = {};
      
      // Only include provided fields
      if (req.body.description !== undefined) data.description = req.body.description;
      if (req.body.size !== undefined) data.size = req.body.size;
      if (req.body.breakers !== undefined) data.breakers = req.body.breakers;
      if (req.body.brand !== undefined) data.brand = req.body.brand;
      if (req.body.ipEnclosure !== undefined) data.ipEnclosure = req.body.ipEnclosure || null;
      if (req.body.pole !== undefined) data.pole = req.body.pole || null;
      if (req.body.price !== undefined) data.price = req.body.price || null;

      const product = await updateProduct(id, data, files, req.user?.username);
      res.json(product);
    } catch (error: any) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ error: error.message });
      }
      logger.error('Update product error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await deleteProduct(id, req.user?.username);
    res.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Delete product error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;

