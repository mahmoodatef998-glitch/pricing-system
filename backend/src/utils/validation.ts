import { z } from 'zod';

// Product validation schemas
export const createProductSchema = z.object({
  description: z.string().min(1, 'Description is required').trim(),
  size: z.string().min(1, 'Size is required').trim(),
  breakers: z.string().min(1, 'Breakers is required').trim(),
  brand: z.string().min(1, 'Brand is required').trim(),
  ipEnclosure: z.string().optional().nullable(),
  pole: z.string().optional().nullable(),
  price: z.string().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const matchProductSchema = z.object({
  description: z.string().min(1, 'Description is required').trim(),
  size: z.string().min(1, 'Size is required').trim(),
  breakers: z.string().min(1, 'Breakers is required').trim(),
  brand: z.string().min(1, 'Brand is required').trim(),
  ipEnclosure: z.string().optional().nullable(),
  pole: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const productFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  breakers: z.string().optional(),
  search: z.string().optional(),
});

// Validation middleware
export function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

// Query validation middleware
export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

