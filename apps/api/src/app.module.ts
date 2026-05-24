import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { HttpModule } from '@nestjs/axios';
import { HttpRequestsUtil } from './utils/http.util';
import { MessengerModule } from './messenger/messenger.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ENVIRONMENT, QUEUE_NAME } from './constants';
import { RedisModule } from './redis/redis.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { validate } from './commons/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env'],
      validate
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<IENV, true>) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: config.get('POSTGRES_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: config.get('ENABLE_DATABASE_SSL') === 'true' ? true : false,
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<IENV, true>) => ({
        connection: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          username: config.get('REDIS_USER'),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 30,
          backoff: {
            type: 'fixed',
            delay: 60000,
          },
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: QUEUE_NAME.MESSAGE_TO_FUTURE,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<IENV, true>) => ({
        errorMessage: 'Too many requests. Try again after some time.',
        throttlers:
          config.get('ENABLE_RATE_LIMITING') === 'true'
            ? [
                {
                  ttl: 60000,
                  limit: 60,
                },
              ]
            : [],
      }),
    }),
    HttpModule,
    MessengerModule,
    AuthModule,
    UserModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
    HttpRequestsUtil,
    EmailService,
  ],
})
export class AppModule {}
