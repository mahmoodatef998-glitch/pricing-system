import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface HistoryEntry {
  id: number;
  productId: number;
  action: 'created' | 'updated' | 'deleted';
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  changes?: any;
  createdAt: Date;
}

/**
 * Log product creation
 */
export async function logProductCreated(
  productId: number,
  userId?: string,
  data?: any
): Promise<void> {
  try {
    await prisma.productHistory.create({
      data: {
        productId,
        action: 'created',
        userId,
        changes: data || {},
      },
    });
  } catch (error) {
    logger.error('Error logging product creation:', error);
  }
}

/**
 * Log product update
 */
export async function logProductUpdated(
  productId: number,
  oldData: any,
  newData: any,
  userId?: string
): Promise<void> {
  try {
    const changes: any = {};
    const fields: Array<{ field: string; oldValue: string; newValue: string }> = [];

    // Compare fields and find changes
    const allFields = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    
    for (const field of allFields) {
      if (oldData[field] !== newData[field]) {
        changes[field] = {
          old: oldData[field],
          new: newData[field],
        };
        fields.push({
          field,
          oldValue: String(oldData[field] || ''),
          newValue: String(newData[field] || ''),
        });
      }
    }

    // Create history entries for each changed field
    for (const { field, oldValue, newValue } of fields) {
      await prisma.productHistory.create({
        data: {
          productId,
          action: 'updated',
          field,
          oldValue,
          newValue,
          userId,
          changes,
        },
      });
    }
  } catch (error) {
    logger.error('Error logging product update:', error);
  }
}

/**
 * Log product deletion
 */
export async function logProductDeleted(
  productId: number,
  userId?: string,
  data?: any
): Promise<void> {
  try {
    await prisma.productHistory.create({
      data: {
        productId,
        action: 'deleted',
        userId,
        changes: data || {},
      },
    });
  } catch (error) {
    logger.error('Error logging product deletion:', error);
  }
}

/**
 * Get product history
 */
export async function getProductHistory(productId: number) {
  return await prisma.productHistory.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all history (with pagination)
 */
export async function getAllHistory(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    prisma.productHistory.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            description: true,
            brand: true,
          },
        },
      },
    }),
    prisma.productHistory.count(),
  ]);

  return {
    history,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


