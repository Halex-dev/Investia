import { Logger, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from '@modules/users/user.module';
import { TransactionsModule } from '@/modules/transactions/transactions.module';
import { CategoryModule } from '@/modules/categories/category.module';

import { User } from '@modules/users/user.entity';
import { Transaction } from '@/modules/transactions/transaction.entity';
import { Category } from '@/modules/categories/category.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggingMiddleware } from './middleware/logger.middleware';
import { CsrfModule } from './modules/csrf/csrf.module';

const customLogger = new Logger('TypeORM');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, //TODO cambiare
        limit: 50, //TODO cambiare quando non faccio 2 richieste ogni volta
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Transaction, Category],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
        logger: {
          log: (level, message) => customLogger.log(message),
          logQuery: (query, parameters) =>
            customLogger.log(`Query: ${query} -- Parameters: ${parameters}`),
          logQueryError: (error, query, parameters) =>
            customLogger.error(
              `Query Error: ${error}`,
              `Query: ${query} -- Parameters: ${parameters}`
            ),
          logQuerySlow: (time, query, parameters) =>
            customLogger.warn(`Slow Query (${time}ms): ${query} -- Parameters: ${parameters}`),
          logSchemaBuild: message => customLogger.log(message),
          logMigration: message => customLogger.log(message),
        },
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    CsrfModule,
    UsersModule,
    TransactionsModule,
    CategoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
