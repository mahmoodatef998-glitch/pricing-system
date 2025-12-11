import { PrismaClient } from '@prisma/client';
import { fileStorage } from '../utils/fileStorage';
import { logger } from '../utils/logger';
import {
  logProductCreated,
  logProductUpdated,
  logProductDeleted,
} from './productHistoryService';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface CreateProductData {
  description: string;
  size: string;
  breakers: string;
  brand: string;
  ipEnclosure?: string;
  pole?: string;
  price?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductFilters {
  page?: number;
  limit?: number;
  brand?: string;
  description?: string;
  size?: string;
  breakers?: string;
  search?: string; // General search across all fields
}

/**
 * Normalize string for duplicate checking
 */
function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

/**
 * Check for duplicate products
 */
export async function checkDuplicateProduct(data: CreateProductData): Promise<any[] | null> {
  const normalizedDescription = normalizeString(data.description);
  const normalizedBreakers = normalizeString(data.breakers);
  const normalizedBrand = normalizeString(data.brand);
  const normalizedSize = normalizeString(data.size);

  // Check for exact matches (case-insensitive)
  const duplicates = await prisma.product.findMany({
    where: {
      brand: {
        equals: normalizedBrand,
        mode: 'insensitive',
      },
      breakers: {
        equals: normalizedBreakers,
        mode: 'insensitive',
      },
      description: {
        equals: normalizedDescription,
        mode: 'insensitive',
      },
      size: {
        equals: normalizedSize,
        mode: 'insensitive',
      },
    },
    include: {
      drawings: true,
    },
  });

  return duplicates.length > 0 ? duplicates : null;
}

export async function createProduct(
  data: CreateProductData,
  files?: Express.Multer.File[]
): Promise<any> {
  try {
    // Check for duplicates first
    const duplicates = await checkDuplicateProduct(data);
    if (duplicates && duplicates.length > 0) {
      throw new Error('DUPLICATE_PRODUCT');
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        description: data.description,
        size: data.size,
        breakers: data.breakers,
        brand: data.brand,
        ipEnclosure: data.ipEnclosure || null,
        pole: data.pole || null,
        price: data.price || null,
      },
    });

    // Handle file uploads (parallel processing for better performance)
    const drawings = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const filePath = await fileStorage.putFile(product.id, file);
        const fileType = path.extname(file.originalname).toLowerCase().slice(1);

        const drawing = await prisma.drawing.create({
          data: {
            productId: product.id,
            filePath,
            fileType,
          },
        });

        return drawing;
      });

      const uploadedDrawings = await Promise.all(uploadPromises);
      drawings.push(...uploadedDrawings);
    }

    // Log product creation
    try {
      await logProductCreated(product.id, undefined, data);
    } catch (error) {
      // Don't fail product creation if history logging fails
      logger.warn('Failed to log product creation:', error);
    }

    return {
      ...product,
      drawings,
    };
  } catch (error) {
    logger.error('Error creating product:', error);
    throw error;
  }
}

export async function getProducts(filters: ProductFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  
  // If general search is provided, search across all fields
  if (filters.search) {
    where.OR = [
      { brand: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { size: { contains: filters.search, mode: 'insensitive' } },
      { breakers: { contains: filters.search, mode: 'insensitive' } },
    ];
  } else {
    // Specific field searches
    const conditions: any[] = [];
    
    if (filters.brand) {
      conditions.push({ brand: { contains: filters.brand, mode: 'insensitive' } });
    }
    if (filters.description) {
      conditions.push({ description: { contains: filters.description, mode: 'insensitive' } });
    }
    if (filters.size) {
      conditions.push({ size: { contains: filters.size, mode: 'insensitive' } });
    }
    if (filters.breakers) {
      conditions.push({ breakers: { contains: filters.breakers, mode: 'insensitive' } });
    }
    
    // If multiple filters, use AND logic
    if (conditions.length > 0) {
      where.AND = conditions;
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        drawings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      drawings: true,
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

export async function updateProduct(
  id: number,
  data: UpdateProductData,
  files?: Express.Multer.File[],
  userId?: string
) {
  try {
    // Get old product data for history
    const oldProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!oldProduct) {
      throw new Error('Product not found');
    }

    // Update product
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.breakers !== undefined) updateData.breakers = data.breakers;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.ipEnclosure !== undefined) updateData.ipEnclosure = data.ipEnclosure || null;
    if (data.pole !== undefined) updateData.pole = data.pole || null;
    if (data.price !== undefined) updateData.price = data.price || null;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        drawings: true,
      },
    });

    // Log product update
    try {
      await logProductUpdated(id, oldProduct, product, userId);
    } catch (error) {
      // Don't fail product update if history logging fails
      logger.warn('Failed to log product update:', error);
    }

    // Handle new file uploads (parallel processing for better performance)
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const filePath = await fileStorage.putFile(product.id, file);
        const fileType = path.extname(file.originalname).toLowerCase().slice(1);

        return prisma.drawing.create({
          data: {
            productId: product.id,
            filePath,
            fileType,
          },
        });
      });

      await Promise.all(uploadPromises);
    }

    return await getProductById(id);
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Product not found');
    }
    logger.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: number, userId?: string) {
  try {
    // Get product with drawings
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        drawings: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Log product deletion before deleting
    try {
      await logProductDeleted(id, userId, product);
    } catch (error) {
      // Don't fail product deletion if history logging fails
      logger.warn('Failed to log product deletion:', error);
    }

    // Delete files from storage
    for (const drawing of product.drawings) {
      try {
        await fileStorage.deleteFile(drawing.filePath);
      } catch (error) {
        logger.warn(`Failed to delete file ${drawing.filePath}:`, error);
      }
    }

    // Delete product directory if using local storage
    if (process.env.STORAGE_PROVIDER !== 's3') {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const productDir = path.join(uploadDir, id.toString());
      try {
        await fs.rm(productDir, { recursive: true, force: true });
      } catch (error) {
        logger.warn(`Failed to delete product directory ${productDir}:`, error);
      }
    }

    // Delete product (cascade will delete drawings)
    await prisma.product.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new Error('Product not found');
    }
    logger.error('Error deleting product:', error);
    throw error;
  }
}

