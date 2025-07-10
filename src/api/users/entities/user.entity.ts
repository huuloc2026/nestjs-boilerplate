// users/user.entity.ts
import { Exclude } from 'class-transformer';
import { User as PrismaUser } from '@prisma/client';

export class User implements PrismaUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;
}