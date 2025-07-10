import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  name: process.env.APP_NAME,
  port: process.env.APP_PORT,
  version: process.env.APP_VERSION,
  description: process.env.APP_DESCRIPTION,
  url: process.env.APP_URL,
  prefix: process.env.APP_PREFIX,
}));

export const appConfigValidation = {
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().required(),
  APP_VERSION: Joi.string().default('1.0.0'),
  APP_DESCRIPTION: Joi.string().default(''),
  APP_URL: Joi.string().default('http://localhost:3000'),
  APP_PREFIX: Joi.string().default('api'),
};

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
}));

export const jwtConfigValidation = {
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
};

// Add similar configs for database, redis, storage, email, etc.