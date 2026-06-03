import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { Product } from '../db/models';
import logger from '../utils/logger';

const router = Router();

// Public: list and view products
router.get('/', apiLimiter, async (req: Request, res: Response) => {
  try {
    const { category, featured, active, search, page = 1, limit = 20 } = req.query;

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (active !== undefined) filter.isActive = active === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', apiLimiter, async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Protected: admin-only product management
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  apiLimiter,
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isString().notEmpty().withMessage('Category is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.create(req.body);
      logger.info(`Product created: ${product._id} by user ${req.user!.id}`);
      res.status(201).json(product);
    } catch (error) {
      logger.error('Create product error:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  apiLimiter,
  [
    param('id').isMongoId().withMessage('Invalid product ID'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      logger.info(`Product updated: ${product._id} by user ${req.user!.id}`);
      res.json(product);
    } catch (error) {
      logger.error('Update product error:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  apiLimiter,
  async (req: Request, res: Response) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      logger.info(`Product deleted: ${req.params.id} by user ${req.user!.id}`);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error('Delete product error:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  }
);

export default router;
