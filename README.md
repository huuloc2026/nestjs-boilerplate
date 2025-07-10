# NestJS Boilerplate with Prisma, PostgreSQL, Redis, and Auth

Here's a comprehensive boilerplate setup for NestJS with production-ready configurations including Prisma, PostgreSQL, Redis, class-transformer, class-validator, and scalable authentication modules.

## 1. Project Setup

First, create a new NestJS project:

```bash
npm i -g @nestjs/cli
nest new nestjs-boilerplate
cd nestjs-boilerplate
```

Create `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

## 10. Final Project Structure

```
src/
├── app/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── dto/
├── common/
│   ├── decorators/
│   ├── exceptions/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── interfaces/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
├── config/
├── database/
│   ├── migrations/
│   ├── prisma/
│   └── seed/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── storage/
│   ├── email/
│   └── payment/
├── main.ts
└── bootstrap.ts
```

## 11. Running the Application

1. Start the database and Redis:

```bash
docker-compose up -d postgres redis
```

2. Apply database migrations:

```bash
npx prisma migrate dev --name init
```

3. Start the application:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000` with Swagger documentation at `http://localhost:3000/api`.

## 12. Key Features

- **Prisma ORM** with PostgreSQL for database operations
- **Redis** for caching and session management
- **JWT Authentication** with access and refresh tokens
- **Class-validator** for request validation
- **Class-transformer** for response serialization
- **UUID** for all entity IDs
- **Rate limiting** with Throttler
- **Security** with Helmet and CORS
- **Docker** setup for easy development
- **Swagger** documentation
- **Scalable auth** ready for OAuth integration

This boilerplate provides a solid foundation for a production-ready NestJS application with authentication and user management. You can easily extend it with additional modules and features as needed.