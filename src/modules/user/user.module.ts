// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module'; // Import PrismaModule
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [PrismaModule], // Ensure PrismaModule is imported here
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export UserService so AuthModule can use it
})
export class UserModule {}