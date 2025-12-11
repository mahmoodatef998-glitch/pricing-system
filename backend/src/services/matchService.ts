import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { fileStorage } from '../utils/fileStorage';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface MatchCriteria {
  description: string;
  size: string;
  breakers: string;
  brand: string;
  ipEnclosure?: string;
  pole?: string;
}

export interface MatchResult {
  matched: boolean;
  product?: {
    id: number;
    description: string;
    size: string;
    breakers: string;
    brand: string;
    ipEnclosure?: string | null;
    pole?: string | null;
    price?: string | null;
    drawings: Array<{
      id: number;
      filePath: string;
      fileType: string;
      url: string;
    }>;
  };
}

/**
 * Normalize string: trim whitespace and convert to lowercase
 */
function normalize(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().toLowerCase();
}

/**
 * Match product based on criteria
 * Uses exact match with normalization (case-insensitive, trimmed)
 * Optional fields (ipEnclosure, pole) only checked if provided
 * 
 * Optimized: Builds precise query instead of fetching all candidates
 */
export async function match(criteria: MatchCriteria): Promise<MatchResult> {
  try {
    const normalizedDescription = normalize(criteria.description);
    const normalizedBreakers = normalize(criteria.breakers);
    const normalizedBrand = normalize(criteria.brand);
    const normalizedSize = normalize(criteria.size);
    const normalizedIpEnclosure = criteria.ipEnclosure ? normalize(criteria.ipEnclosure) : undefined;
    const normalizedPole = criteria.pole ? normalize(criteria.pole) : undefined;

    // Build precise where clause with all conditions
    const whereConditions: any = {
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
    };

    // Add optional fields if provided
    if (normalizedIpEnclosure !== undefined) {
      whereConditions.ipEnclosure = {
        equals: normalizedIpEnclosure,
        mode: 'insensitive',
      };
    }

    if (normalizedPole !== undefined) {
      whereConditions.pole = {
        equals: normalizedPole,
        mode: 'insensitive',
      };
    }

    // Fetch product with precise query (more efficient than fetching all candidates)
    const product = await prisma.product.findFirst({
      where: whereConditions,
      include: {
        drawings: true,
      },
    });

    // Double-check with normalization for exact match (Prisma's case-insensitive might not be perfect)
    if (product) {
      const exactMatch = 
        normalize(product.description) === normalizedDescription &&
        normalize(product.size) === normalizedSize &&
        normalize(product.breakers) === normalizedBreakers &&
        normalize(product.brand) === normalizedBrand &&
        (normalizedIpEnclosure === undefined || normalize(product.ipEnclosure) === normalizedIpEnclosure) &&
        (normalizedPole === undefined || normalize(product.pole) === normalizedPole);

      if (!exactMatch) {
        return { matched: false };
      }
    } else {
      return { matched: false };
    }

    // Build file URLs for drawings
    const drawings = await Promise.all(
      product.drawings.map(async (drawing) => {
        // Use fileStorage to get the correct URL (works for both local and Cloudinary)
        const filename = drawing.filePath.split('/').pop() || drawing.filePath.split('\\').pop() || drawing.filePath;
        const url = await fileStorage.getFileUrl(product.id, drawing.filePath);
        return {
          id: drawing.id,
          filePath: drawing.filePath,
          fileType: drawing.fileType,
          url,
        };
      })
    );

    return {
      matched: true,
      product: {
        id: product.id,
        description: product.description,
        size: product.size,
        breakers: product.breakers,
        brand: product.brand,
        ipEnclosure: product.ipEnclosure,
        pole: product.pole,
        price: product.price,
        drawings,
      },
    };
  } catch (error) {
    logger.error('Error in match service:', error);
    throw error;
  }
}

