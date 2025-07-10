"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nestjs_pino_1 = require("nestjs-pino");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app/app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const secureSession = require("@fastify/secure-session");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter(), { bufferLogs: true });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port');
    const env = configService.get('app.env');
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: env === 'production',
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('NestJS Boilerplate API')
        .setDescription('Comprehensive API documentation for the NestJS project.')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter JWT token' }, 'access-token')
        .addTag('Auth', 'Authentication related endpoints')
        .addTag('Users', 'User management endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.register(secureSession, {
        secret: configService.get('FASTIFY_SESSION_SECRET') || 'aVeryLongAndRandomSecretKeyForFastifySessions',
        salt: configService.get('FASTIFY_SESSION_SALT') || 'someRandomSalt',
        cookie: {
            path: '/',
            secure: env === 'production',
            httpOnly: true,
            sameSite: 'lax',
        },
    });
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map