import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  // Social Auth Keys (example for Google)
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // AWS S3
  awsS3Region: process.env.AWS_S3_REGION,
  awsS3AccessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  awsS3SecretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
  // Alibaba Cloud OSS
  aliyunOssRegion: process.env.ALIYUN_OSS_REGION,
  aliyunOssAccessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID,
  aliyunOssAccessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET,
  aliyunOssBucketName: process.env.ALIYUN_OSS_BUCKET_NAME,
  // Tencent Cloud COS
  tencentCosRegion: process.env.TENCENT_COS_REGION,
  tencentCosSecretId: process.env.TENCENT_COS_SECRET_ID,
  tencentCosSecretKey: process.env.TENCENT_COS_SECRET_KEY,
  tencentCosBucketName: process.env.TENCENT_COS_BUCKET_NAME,
  // Nodemailer
  nodemailerHost: process.env.NODEMAILER_HOST,
  nodemailerPort: parseInt(process.env.NODEMAILER_PORT || '587', 10),
  nodemailerUser: process.env.NODEMAILER_USER,
  nodemailerPass: process.env.NODEMAILER_PASS,
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  // BetterAuth (if applicable, replace with actual config)
  betterAuthApiKey: process.env.BETTERAUTH_API_KEY,
}));

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(), // Recommend strong secret
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  // Social Auth
  GOOGLE_CLIENT_ID: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  GOOGLE_CLIENT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  // AWS S3
  AWS_S3_REGION: Joi.string().optional(),
  AWS_S3_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_S3_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_S3_BUCKET_NAME: Joi.string().optional(),
  // Alibaba Cloud OSS
  ALIYUN_OSS_REGION: Joi.string().optional(),
  ALIYUN_OSS_ACCESS_KEY_ID: Joi.string().optional(),
  ALIYUN_OSS_ACCESS_KEY_SECRET: Joi.string().optional(),
  ALIYUN_OSS_BUCKET_NAME: Joi.string().optional(),
  // Tencent Cloud COS
  TENCENT_COS_REGION: Joi.string().optional(),
  TENCENT_COS_SECRET_ID: Joi.string().optional(),
  TENCENT_COS_SECRET_KEY: Joi.string().optional(),
  TENCENT_COS_BUCKET_NAME: Joi.string().optional(),
  // Nodemailer
  NODEMAILER_HOST: Joi.string().optional(),
  NODEMAILER_PORT: Joi.number().optional(),
  NODEMAILER_USER: Joi.string().optional(),
  NODEMAILER_PASS: Joi.string().optional(),
  // Stripe
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  // BetterAuth
  BETTERAUTH_API_KEY: Joi.string().optional(),
});