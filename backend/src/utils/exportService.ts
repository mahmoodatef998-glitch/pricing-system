import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ExportOptions {
  format: 'excel' | 'pdf';
  filters?: {
    brand?: string;
    description?: string;
    page?: number;
    limit?: number;
  };
}

/**
 * Export products to Excel
 */
export async function exportToExcel(options?: ExportOptions['filters'], productIds?: number[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  // Define columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Description', key: 'description', width: 20 },
    { header: 'Size', key: 'size', width: 15 },
    { header: 'Breakers', key: 'breakers', width: 20 },
    { header: 'Brand', key: 'brand', width: 15 },
    { header: 'IP Enclosure', key: 'ipEnclosure', width: 15 },
    { header: 'Pole', key: 'pole', width: 10 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Drawings Count', key: 'drawingsCount', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Fetch products
  const filters = {
    page: options?.page || 1,
    limit: options?.limit || 10000, // Large limit for export
    brand: options?.brand,
    description: options?.description,
  };

  const where: any = {};
  
  // If productIds provided, export only those products
  if (productIds && productIds.length > 0) {
    where.id = { in: productIds };
  } else {
    // Otherwise use filters
    if (filters.brand) {
      where.brand = { equals: filters.brand, mode: 'insensitive' };
    }
    if (filters.description) {
      where.description = { equals: filters.description, mode: 'insensitive' };
    }
  }

  const result = await prisma.product.findMany({
    where,
    include: {
      drawings: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(productIds && productIds.length > 0 ? {} : {
      take: filters.limit,
      skip: (filters.page - 1) * filters.limit,
    }),
  });

  // Add data rows
  result.forEach((product) => {
    worksheet.addRow({
      id: product.id,
      description: product.description,
      size: product.size,
      breakers: product.breakers,
      brand: product.brand,
      ipEnclosure: product.ipEnclosure || 'N/A',
      pole: product.pole || 'N/A',
      price: product.price || 'N/A',
      drawingsCount: product.drawings.length,
      createdAt: product.createdAt.toLocaleString(),
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    if (column.width) {
      column.width = Math.min(column.width || 10, 50);
    }
  });

  return workbook;
}

/**
 * Export products to PDF
 */
export async function exportToPDF(options?: ExportOptions['filters'], productIds?: number[]): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Products Export', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Fetch products
      const filters = {
        page: options?.page || 1,
        limit: options?.limit || 10000,
        brand: options?.brand,
        description: options?.description,
      };

      const where: any = {};
      
      // If productIds provided, export only those products
      if (productIds && productIds.length > 0) {
        where.id = { in: productIds };
      } else {
        // Otherwise use filters
        if (filters.brand) {
          where.brand = { equals: filters.brand, mode: 'insensitive' };
        }
        if (filters.description) {
          where.description = { equals: filters.description, mode: 'insensitive' };
        }
      }

      const result = await prisma.product.findMany({
        where,
        include: {
          drawings: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        ...(productIds && productIds.length > 0 ? {} : {
          take: filters.limit,
          skip: (filters.page - 1) * filters.limit,
        }),
      });

      // Add products
      result.forEach((product, index) => {
        if (index > 0 && index % 5 === 0) {
          doc.addPage();
        }

        doc.fontSize(14).text(`Product #${product.id}`, { underline: true });
        doc.fontSize(10);
        doc.text(`Description: ${product.description}`);
        doc.text(`Size: ${product.size}`);
        doc.text(`Breakers: ${product.breakers}`);
        doc.text(`Brand: ${product.brand}`);
        doc.text(`IP Enclosure: ${product.ipEnclosure || 'N/A'}`);
        doc.text(`Pole: ${product.pole || 'N/A'}`);
        doc.text(`Price: ${product.price || 'N/A'}`);
        doc.text(`Drawings: ${product.drawings.length} file(s)`);
        doc.text(`Created: ${product.createdAt.toLocaleString()}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}


