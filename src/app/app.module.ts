import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import configuration, { validationSchema } from 'src/config/configuration';

@Module({
  imports: [LoggerModule.forRoot(),
  ConfigModule.forRoot({
    load: [configuration], // This loads your configuration object
    validationSchema,
    isGlobal: true,        // Makes ConfigService available globally
    envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Loads .env.development, etc.
    ignoreEnvFile: process.env.NODE_ENV === 'production', // Typically false for local dev
  }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
