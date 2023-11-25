import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Employee } from '@prisma/client';

@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get burnout employees',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  getBurnoutEmployees(): Promise<Employee[]> {
    try {
      return this.appService.getBurnoutEmployees();
      // return res.status(200).json({ data: emploees });
    } catch (error) {
      return error.message;
      // return res.status(error.statusCode ?? 400).json({ error: error.message });
    }
  }
}
