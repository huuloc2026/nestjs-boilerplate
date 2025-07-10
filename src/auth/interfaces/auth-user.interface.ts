// src/modules/auth/interfaces/auth-user.interface.ts
import { Role } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  roles: Role[];
  isActive: boolean;
 
}