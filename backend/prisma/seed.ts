import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user (store password hash in env or use default)
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  
  // Store hash for auth route
  process.env.ADMIN_PASSWORD_HASH = adminPasswordHash;
  
  console.log(`Admin user: ${adminUsername}`);
  console.log('⚠️  IMPORTANT: Change admin password in production!');

  // Ensure uploads directory exists
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  await fs.mkdir(uploadDir, { recursive: true });

  // Seed products
  const products = [
    {
      description: 'ATS',
      size: '32-40',
      breakers: 'CONTACTORS',
      brand: 'LS',
      ipEnclosure: '54',
      pole: '3P',
      price: 'MANUAL',
    },
    {
      description: 'SYNCRO',
      size: '41-50',
      breakers: 'MCCB MOTORIZED',
      brand: 'EKF',
      ipEnclosure: '66',
      pole: '4P',
      price: null,
    },
    {
      description: 'TOTALIZING',
      size: '66-100',
      breakers: 'ACB',
      brand: 'CHNIDER',
      ipEnclosure: null,
      pole: null,
      price: null,
    },
    {
      description: '',
      size: '',
      breakers: '',
      brand: 'LIGRAND',
      ipEnclosure: null,
      pole: null,
      price: null,
    },
    {
      description: '',
      size: '',
      breakers: '',
      brand: 'ABB',
      ipEnclosure: null,
      pole: null,
      price: null,
    },
    {
      description: '',
      size: '',
      breakers: '',
      brand: 'ETON',
      ipEnclosure: null,
      pole: null,
      price: null,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Create placeholder drawing file
    const productDir = path.join(uploadDir, product.id.toString());
    await fs.mkdir(productDir, { recursive: true });

    const placeholderContent = `Placeholder drawing for product ${product.id}\nDescription: ${product.description}\nBrand: ${product.brand}`;
    const filename = `placeholder_${product.id}.txt`;
    const filePath = path.join(productDir, filename);

    await fs.writeFile(filePath, placeholderContent);

    // Create drawing record
    await prisma.drawing.create({
      data: {
        productId: product.id,
        filePath,
        fileType: 'txt',
      },
    });

    console.log(`Created product: ${product.brand} - ${product.description || 'N/A'}`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

