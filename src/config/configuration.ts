

export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRATION_TIME,
    refreshTokenExpirationTime: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
  },
   throttler: { // Example of how to structure it
    ttl: parseInt(process.env.THROTTLER_TTL ?? '', 10) || 60,
    limit: parseInt(process.env.THROTTLER_LIMIT ?? '', 10) || 10,
  },
});