import { Controller, Get } from '@nestjs/common';
import { validateResponseDto } from 'src/common/utils/validate-response.util';
import { AppService } from './app.service';
import { HealthResponseDto } from './app/dto/health-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/db')
  async getDbHealth() {
    const result = await this.appService.getDbHealth();
    return validateResponseDto(HealthResponseDto, result);
  }
}
