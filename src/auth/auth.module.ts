import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from 'src/database/prisma.module';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from 'src/modules/mail/mail.module';
import { UserModule } from 'src/modules/user/user.module';
import { LocalStrategy } from './strategies/local.strategy';




// Import social strategies here as you add them (GoogleStrategy, GitHubStrategy, etc.)

@Module({
  imports: [
    UserModule,
    PrismaModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwtSecret'),
        signOptions: { expiresIn: configService.get<string>('app.jwtExpiresIn') },
      }),
    }),
    
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