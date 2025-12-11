# Full Stack Pricing System

A production-ready full-stack application for managing product specifications, pricing, and drawings with auto-matching capabilities.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript + Prisma
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **File Storage**: Local filesystem (S3-ready abstraction)

## Features

- Product specification management (description, size, breakers, brand, IP enclosure, pole, price)
- File upload support (PDF, JPG, PNG, DWG) for product drawings
- Auto-matching endpoint to find existing products with exact-match rules
- JWT-based admin authentication
- RESTful API with pagination and filtering
- Responsive web interface

## Project Structure

```
/project-root
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── tests/
│   └── env.example
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── env.example
├── docker-compose.yml
└── README.md
```

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd pricing-system
```

2. Create environment files (optional, defaults are provided):
```bash
# Backend
cp backend/env.example backend/.env

# Frontend
cp frontend/env.example frontend/.env.local
```

3. Build and start all services:
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database on port 5433
- Start backend API on port 4000
- Start frontend on port 3001
- Start Adminer (database admin) on port 8081
- Run database migrations automatically
- Seed the database with sample data

4. Access the application:
- Frontend: http://localhost:3001
- Backend API: http://localhost:4000
- Adminer: http://localhost:8081
- Prisma Studio: http://localhost:5557
- API Health Check: http://localhost:4000/health

### Default Admin Credentials

- Username: `admin`
- Password: `ChangeMe123!`

**⚠️ IMPORTANT**: Change these credentials in production!

## Local Development

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

Edit `.env` with your database URL:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pricing_db?schema=public"
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
UPLOAD_DIR=./uploads
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe123!
```

4. Set up database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run seed
```

5. Start development server:
```bash
npm run dev
```

Backend will run on http://localhost:4000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "ChangeMe123!"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use the token in subsequent requests:
```http
Authorization: Bearer <token>
```

### Products

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

description: ATS
size: 34
breakers: CONTACTORS
brand: LS
ipEnclosure: 54
pole: 3P
price: MANUAL
files: [file1.pdf, file2.jpg]
```

#### Get All Products
```http
GET /api/products?page=1&limit=10&brand=LS&description=ATS
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Update Product (Admin)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

description: Updated ATS
files: [new-file.pdf]
```

#### Delete Product (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Match

#### Match Product (Public)
```http
POST /api/match
Content-Type: application/json

{
  "description": "ATS",
  "size": "34",
  "breakers": "CONTACTORS",
  "brand": "LS",
  "ipEnclosure": "54",
  "pole": "3P"
}
```

Response (matched):
```json
{
  "matched": true,
  "product": {
    "id": 1,
    "description": "ATS",
    "size": "34",
    "breakers": "CONTACTORS",
    "brand": "LS",
    "ipEnclosure": "54",
    "pole": "3P",
    "price": "MANUAL",
    "drawings": [
      {
        "id": 1,
        "filePath": "/uploads/1/1234567890_file.pdf",
        "fileType": "pdf",
        "url": "/uploads/1/1234567890_file.pdf"
      }
    ]
  }
}
```

Response (no match):
```json
{
  "matched": false
}
```

## Matching Logic

The matching endpoint uses exact-match rules with normalization:

- **Case-insensitive**: All string comparisons are case-insensitive
- **Trimmed**: Whitespace is trimmed from all inputs
- **Required fields**: `description`, `size`, `breakers`, `brand` must match exactly
- **Optional fields**: `ipEnclosure` and `pole` are only checked if provided in the request

Example:
- Request with `ipEnclosure: "54"` will only match products with `ipEnclosure: "54"`
- Request without `ipEnclosure` will match products regardless of their `ipEnclosure` value

## File Storage

### Local Storage (Default)

Files are stored in `backend/uploads/<productId>/` directory.

Access files via: `http://localhost:4000/uploads/<productId>/<filename>`

### S3 Storage (Future)

To switch to S3 storage:

1. Set environment variables:
```
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

2. Implement S3 client in `backend/src/utils/fileStorage.ts` (currently throws error)

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Tests include:
- Unit tests for match service
- Integration tests for `/api/match` endpoint

### Test Database

For integration tests, use a separate test database:
```
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pricing_test_db?schema=public"
```

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `UPLOAD_DIR` | Directory for file uploads | `./uploads` |
| `ADMIN_USERNAME` | Admin username | `admin` |
| `ADMIN_PASSWORD` | Admin password | `ChangeMe123!` |
| `STORAGE_PROVIDER` | Storage provider (`local` or `s3`) | `local` |
| `NODE_ENV` | Node environment | `development` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` |

## Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` to secure credentials
- [ ] Update `DATABASE_URL` with production database credentials
- [ ] Set `NODE_ENV=production`
- [ ] Configure S3 storage (if using cloud storage)
- [ ] Set up proper CORS origins in backend
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Review and update file upload size limits
- [ ] Set up rate limiting for API endpoints

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` is correct
3. Verify database credentials
4. Check network connectivity between containers

### File Upload Issues

If file uploads fail:
1. Check `UPLOAD_DIR` exists and is writable
2. Verify file size is within limits (50MB default)
3. Check file types are allowed (PDF, JPG, PNG, DWG)

### Authentication Issues

If login fails:
1. Verify admin credentials in environment variables
2. Check JWT_SECRET is set
3. Ensure token is included in Authorization header

### Docker Issues

If containers won't start:
1. Check Docker and Docker Compose versions
2. Verify ports 3000, 4000, 5432, 8080 are available
3. Check container logs: `docker-compose logs <service-name>`
4. Rebuild containers: `docker-compose up --build --force-recreate`

## API Examples

### cURL Examples

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"ChangeMe123!"}'
```

#### Match Product
```bash
curl -X POST http://localhost:4000/api/match \
  -H "Content-Type: application/json" \
  -d '{
    "description": "ATS",
    "size": "34",
    "breakers": "CONTACTORS",
    "brand": "LS",
    "ipEnclosure": "54",
    "pole": "3P"
  }'
```

#### Create Product (with auth token)
```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -F "description=ATS" \
  -F "size=34" \
  -F "breakers=CONTACTORS" \
  -F "brand=LS" \
  -F "ipEnclosure=54" \
  -F "pole=3P" \
  -F "price=MANUAL" \
  -F "files=@drawing1.pdf" \
  -F "files=@drawing2.jpg"
```

#### Get Products
```bash
curl http://localhost:4000/api/products?page=1&limit=10
```

## Seed Data

The seed script creates the following sample products:

1. ATS - LS - 34 - CONTACTORS - IP54 - 3P - MANUAL
2. SYNCRO - EKF - TO - MCCB MOTORIZED - IP66 - 4P
3. TOTALIZING - CHNIDER - 4000 - ACB
4. LIGRAND (empty description)
5. ABB (empty description)
6. ETON (empty description)

Each product includes a placeholder drawing file.

## License

[Your License Here]

## Support

For issues and questions, please open an issue in the repository.

