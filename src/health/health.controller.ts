import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('v1/health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
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
  async health() {
    return 'ok';
  }
}
