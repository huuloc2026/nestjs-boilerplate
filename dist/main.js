"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _platformfastify = require("@nestjs/platform-fastify");
const _swagger = require("@nestjs/swagger");
const _nestjspino = require("nestjs-pino");
const _common = require("@nestjs/common");
const _appmodule = require("./app/app.module");
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule, new _platformfastify.FastifyAdapter(), {
        bufferLogs: true
    });
    // Logger
    app.useLogger(app.get(_nestjspino.Logger));
    // Validation
    app.useGlobalPipes(new _common.ValidationPipe({
        transform: true
    }));
    // Swagger
    const config = new _swagger.DocumentBuilder().setTitle('API Documentation').setDescription('API description').setVersion('1.0').addBearerAuth().build();
    const document = _swagger.SwaggerModule.createDocument(app, config);
    _swagger.SwaggerModule.setup('docs', app, document);
    await app.listen(3000, '0.0.0.0');
}
bootstrap();

//# sourceMappingURL=main.js.map