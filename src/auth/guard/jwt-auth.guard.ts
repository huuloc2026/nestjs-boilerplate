// src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed.');
    }
    return user;
  }
}