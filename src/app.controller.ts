import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getServerStatus(): object {
    return this.appService.getServerStatus();
  }

  @Post() 
  send() {
    return this.appService.send()
  }
}
