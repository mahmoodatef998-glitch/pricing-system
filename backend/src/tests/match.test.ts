import { match, MatchCriteria } from '../services/matchService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    product: {
      findFirst: jest.fn(),
      findMany: jest.fn(), // Keep for backward compatibility
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('MatchService', () => {
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('match', () => {
    it('should return matched product when exact match found', async () => {
      const mockProduct = {
        id: 1,
        description: 'ats',
        size: '34',
        breakers: 'contactors',
        brand: 'ls',
        ipEnclosure: '54',
        pole: '3p',
        price: 'MANUAL',
        drawings: [
          {
            id: 1,
            filePath: '/uploads/1/placeholder_1.txt',
            fileType: 'txt',
          },
        ],
      };

      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const criteria: MatchCriteria = {
        description: 'ATS',
        size: '34',
        breakers: 'CONTACTORS',
        brand: 'LS',
        ipEnclosure: '54',
        pole: '3P',
      };

      const result = await match(criteria);

      expect(result.matched).toBe(true);
      expect(result.product).toBeDefined();
      expect(result.product?.id).toBe(1);
      expect(result.product?.description).toBe('ats');
    });

    it('should match case-insensitively', async () => {
      const mockProduct = {
        id: 1,
        description: 'ats',
        size: '34',
        breakers: 'contactors',
        brand: 'ls',
        ipEnclosure: null,
        pole: null,
        price: null,
        drawings: [],
      };

      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const criteria: MatchCriteria = {
        description: 'Ats',
        size: '34',
        breakers: 'Contactors',
        brand: 'Ls',
      };

      const result = await match(criteria);

      expect(result.matched).toBe(true);
      expect(prisma.product.findFirst).toHaveBeenCalled();
    });

    it('should match when optional fields are not provided', async () => {
      const mockProduct = {
        id: 1,
        description: 'ats',
        size: '34',
        breakers: 'contactors',
        brand: 'ls',
        ipEnclosure: '54',
        pole: '3p',
        price: null,
        drawings: [],
      };

      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const criteria: MatchCriteria = {
        description: 'ATS',
        size: '34',
        breakers: 'CONTACTORS',
        brand: 'LS',
        // ipEnclosure and pole not provided
      };

      const result = await match(criteria);

      expect(result.matched).toBe(true);
      const whereClause = (prisma.product.findFirst as jest.Mock).mock.calls[0][0].where;
      // Optional fields should not be in where clause when not provided
      expect(whereClause.ipEnclosure).toBeUndefined();
      expect(whereClause.pole).toBeUndefined();
    });

    it('should return no match when product not found', async () => {
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);

      const criteria: MatchCriteria = {
        description: 'NONEXISTENT',
        size: '99',
        breakers: 'TEST',
        brand: 'TEST',
      };

      const result = await match(criteria);

      expect(result.matched).toBe(false);
      expect(result.product).toBeUndefined();
    });

    it('should handle optional fields when provided', async () => {
      const mockProduct = {
        id: 1,
        description: 'ats',
        size: '34',
        breakers: 'contactors',
        brand: 'ls',
        ipEnclosure: '54',
        pole: '3p',
        price: null,
        drawings: [],
      };

      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const criteria: MatchCriteria = {
        description: 'ATS',
        size: '34',
        breakers: 'CONTACTORS',
        brand: 'LS',
        ipEnclosure: '54',
        pole: '3P',
      };

      const result = await match(criteria);

      expect(result.matched).toBe(true);
      const whereClause = (prisma.product.findFirst as jest.Mock).mock.calls[0][0].where;
      // Updated to match new structure (equals with mode)
      expect(whereClause.ipEnclosure).toEqual({ equals: '54', mode: 'insensitive' });
      expect(whereClause.pole).toEqual({ equals: '3p', mode: 'insensitive' });
    });
  });
});

