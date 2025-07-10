# 🚀 NestJS Advanced Boilerplate 2025

A comprehensive, production-ready NestJS boilerplate with modern tools and best practices.

![NestJS](https://img.shields.io/badge/NestJS-v11.0-red?style=for-the-badge&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![Fastify](https://img.shields.io/badge/Fastify-v11.1-black?style=for-the-badge&logo=fastify)
![Prisma](https://img.shields.io/badge/Prisma-6.11-darkblue?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)

## 📋 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | NestJS 11.x with Fastify |
| **Database** | PostgreSQL with Prisma ORM |
| **Compiler** | SWC for TypeScript |
| **Package Manager** | pnpm |
| **Authentication** | JWT with Passport |
| **Documentation** | Swagger/OpenAPI |
| **Validation** | class-validator with DTOs |
| **Logging** | Pino for structured logging |
| **Testing** | Jest |
| **Linting** | ESLint with TypeScript rules |
| **Storage** | Multi-cloud storage support (AWS S3, Alibaba OSS, Tencent COS) |

## 🎯 Features

### 🏗️ Architecture
- **Modular architecture** with proper separation of concerns
- **Configuration management** with @nestjs/config and Joi validation
- **Global exception handling** and request/response transformation
- **Database integration** with Prisma ORM, migrations, and data seeding
- **Caching** with Redis integration
- **Structured logging** with Pino and pino-datadog-transport

### 🔐 Authentication & Authorization
- **Email sign-in/sign-up** with JWT and Passport
- **Social authentication** with multiple providers:
  - Google OAuth
  - GitHub OAuth  
  - Facebook OAuth
  - Discord OAuth
- **BetterAuth integration** for enhanced security
- **Role-based access control** with Admin and User base roles
- **Complete auth flow**:
  - User registration with email verification
  - Login with JWT tokens
  - Refresh token mechanism
  - Password reset functionality
  - Password change for authenticated users
  - Account activation/deactivation

### 🌐 API Features
- **Comprehensive REST API** with full CRUD operations
- **Swagger documentation** with detailed examples
- **Input validation** with class-validator DTOs
- **Response serialization** with class-transformer
- **Pagination support** for list endpoints
- **Rate limiting** with Throttler
- **Security headers** with Helmet
- **CORS configuration**

### 📁 Storage & Communication
- **Unified cloud storage** interface supporting:
  - Amazon S3
  - Alibaba Cloud OSS
  - Tencent Cloud COS
- **Email system** with Nodemailer and MJML templates
- **Internationalization** with nestjs-i18n
- **Payment processing** with Stripe integration

### 🧪 Development & Deployment
- **Comprehensive testing** with Jest (unit and E2E)
- **CI/CD ready** with GitHub Actions
- **Docker support** for development and production
- **Performance optimization** with Fastify and SWC
- **Git hooks** with Husky and conventional commits
- **Code quality** with ESLint, Prettier, and lint-staged

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- pnpm
- Docker & Docker Compose
- PostgreSQL

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nestjs-boilerplate
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start databases with Docker**
```bash
docker-compose up -d postgres redis
```

5. **Run database migrations**
```bash
pnpm prisma:migrate
pnpm prisma:generate
```

6. **Start the development server**
```bash
pnpm start:dev
```

The API will be available at `http://localhost:3000` with Swagger documentation at `http://localhost:3000/docs`.

## 📂 Project Structure

```
nestjs-boilerplate/
├── src/
│   ├── app/                     # Main application module
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── app.service.ts
│   ├── auth/                    # Authentication module
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── guard/               # Auth guards
│   │   ├── interfaces/          # TypeScript interfaces
│   │   ├── strategies/          # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── common/                  # Shared utilities
│   │   ├── decorators/          # Custom decorators
│   │   └── guards/              # Global guards
│   ├── config/                  # Configuration management
│   │   └── configuration.ts
│   ├── database/                # Database configuration
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── modules/                 # Feature modules
│   │   ├── mail/                # Email service
│   │   ├── storage/             # Cloud storage
│   │   └── user/                # User management
│   ├── test/                    # Test module
│   └── main.ts                  # Application entry point
├── prisma/                      # Database schema & migrations
│   ├── migrations/
│   └── schema.prisma
├── test/                        # Test files
│   ├── unit/
│   └── app.e2e-spec.ts
├── .env.example                 # Environment variables template
├── .swcrc                       # SWC configuration
├── docker-compose.yml           # Docker services
├── pnpm-workspace.yaml          # pnpm workspace config
└── tsconfig.json               # TypeScript configuration
```

## 🔧 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | User login |
| `GET` | `/auth/profile` | Get user profile |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | User logout |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password |
| `POST` | `/auth/change-password` | Change password |
| `POST` | `/auth/verify-email` | Verify email address |
| `POST` | `/auth/resend-verification` | Resend verification email |
| `GET` | `/auth/health` | Auth service health check |

### Social Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google` | Google OAuth login |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `GET` | `/auth/github` | GitHub OAuth login |
| `GET` | `/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/auth/facebook` | Facebook OAuth login |
| `GET` | `/auth/facebook/callback` | Facebook OAuth callback |
| `GET` | `/auth/discord` | Discord OAuth login |
| `GET` | `/auth/discord/callback` | Discord OAuth callback |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get users with pagination |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Create new user |
| `PATCH` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Delete user |
| `PATCH` | `/users/:id/toggle-status` | Toggle user status |

## 🔑 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# App Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nestjs_boilerplate

# JWT
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=1h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Social Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
AWS_S3_REGION=us-west-2
AWS_S3_ACCESS_KEY_ID=your-aws-access-key
AWS_S3_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket

# Email (Nodemailer)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=587
NODEMAILER_USER=your-email@gmail.com
NODEMAILER_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests  
pnpm test:e2e

# Test coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

## 📦 Scripts

```bash
# Development
pnpm start:dev          # Start in development mode
pnpm start:debug        # Start with debug mode

# Production
pnpm build              # Build the application
pnpm start:prod         # Start production server

# Database
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run database migrations
pnpm prisma:studio      # Open Prisma Studio

# Code Quality
pnpm lint               # Lint code
pnpm format             # Format code with Prettier
pnpm lint:fix           # Fix linting issues

# Testing
pnpm test               # Run unit tests
pnpm test:e2e           # Run E2E tests
pnpm test:cov           # Generate test coverage
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t nestjs-app .
docker run -p 3000:3000 nestjs-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

Built with ❤️ by Jake Onyx - 2025

This boilerplate provides a solid foundation for building production-ready NestJS applications with modern tools and best practices. Perfect for startups, enterprises, and developers who want to focus on business logic rather than boilerplate setup.