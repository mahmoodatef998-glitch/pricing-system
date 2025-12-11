import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsData {
  totalProducts: number;
  totalDrawings: number;
  productsByBrand: Array<{
    brand: string;
    count: number;
  }>;
  productsByDescription: Array<{
    description: string;
    count: number;
  }>;
  productsByBreakers: Array<{
    breakers: string;
    count: number;
  }>;
  recentProducts: number; // Last 7 days
  averageDrawingsPerProduct: number;
  topBrands: Array<{
    brand: string;
    count: number;
  }>;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  // Total products
  const totalProducts = await prisma.product.count();

  // Total drawings
  const totalDrawings = await prisma.drawing.count();

  // Products by brand
  const productsByBrandRaw = await prisma.product.groupBy({
    by: ['brand'],
    _count: {
      _all: true,
    },
  });

  const productsByBrand = productsByBrandRaw
    .map((item) => ({
      brand: item.brand,
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  // Products by description
  const productsByDescriptionRaw = await prisma.product.groupBy({
    by: ['description'],
    _count: {
      _all: true,
    },
  });

  const productsByDescription = productsByDescriptionRaw
    .map((item) => ({
      description: item.description,
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  // Products by breakers
  const productsByBreakersRaw = await prisma.product.groupBy({
    by: ['breakers'],
    _count: {
      _all: true,
    },
  });

  const productsByBreakers = productsByBreakersRaw
    .map((item) => ({
      breakers: item.breakers,
      count: item._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  // Recent products (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentProducts = await prisma.product.count({
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
  });

  // Average drawings per product
  const averageDrawingsPerProduct = totalProducts > 0 ? totalDrawings / totalProducts : 0;

  // Top brands (top 5)
  const topBrands = productsByBrand.slice(0, 5);

  return {
    totalProducts,
    totalDrawings,
    productsByBrand,
    productsByDescription,
    productsByBreakers,
    recentProducts,
    averageDrawingsPerProduct: Math.round(averageDrawingsPerProduct * 100) / 100,
    topBrands,
  };
}


