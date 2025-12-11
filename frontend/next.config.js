/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel - Vercel handles this automatically
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      '*.cloudinary.com'
    ],
  },
  // For Vercel deployment
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4000'),
  },
}

module.exports = nextConfig

