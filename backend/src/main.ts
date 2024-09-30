import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { CsrfService } from '@/modules/csrf/csrf.service';
import cookieParser from 'cookie-parser';
import { RecurringTransactionService } from '@/modules/transactions/recurring-transaction.service';

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000', // Sostituisci con l'URL del tuo frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validateCustomDecorators: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const csrfService = app.get(CsrfService);

  app.use((req, res, next) => {
    if (req.method === 'GET') {
      const token = csrfService.generateToken();
      res.cookie('XSRF-TOKEN', token, { httpOnly: false, sameSite: 'strict' });
      console.log('Generated CSRF token:', token);
    } else {
      /*const token = req.cookies['XSRF-TOKEN'];
      if (!token || !csrfService.validateToken(token)) {
        return res.status(403).send('Invalid CSRF token');
      }*/
    }
    next();
  });

  // Configurazione Swagger
  const config = new DocumentBuilder()
    .setTitle('Finance Manager API')
    .setDescription('API documentation for the Finance Manager application')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('users')
    .addTag('transactions')
    .addTag('categories')
    .addCookieAuth('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3001);

  // Esegui i controlli all'avvio
  const recurringTransactionService = app.get(RecurringTransactionService);
  await recurringTransactionService.runAllChecks();
}
bootstrap();
