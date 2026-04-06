import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email/email.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { HttpRequestsUtil } from './utils/http.util';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpRequestsUtil, EmailService],
})
export class AppModule {}
