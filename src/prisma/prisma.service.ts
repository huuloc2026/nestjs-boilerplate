// prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client'; // Keep Prisma import for other types if needed

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // <--- ADD 'beforeExit' here
    });
  }

  async onModuleInit() {
    await this.$connect();
  }


}