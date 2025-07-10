import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../../database/prisma.module';
import { LocalStrategy } from './strategies/local.strategy'; // For email/password login
import { MailModule } from '../mail/mail.module'; // For sending confirmation emails
// Import social strategies here as you add them (GoogleStrategy, GitHubStrategy, etc.)

@Module({
  imports: [
    UserModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigService],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwtSecret'),
        signOptions: { expiresIn: configService.get<string>('app.jwtExpiresIn') },
      }),
    }),
    MailModule, // Integrate mail module for auth-related emails
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy, // Provide LocalStrategy
    // Add social strategies here (e.g., GoogleStrategy, GitHubStrategy)
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}