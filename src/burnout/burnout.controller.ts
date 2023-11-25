import { Body, Controller, Post } from '@nestjs/common';
import { BurnoutService } from './burnout.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BurnoutIndexDto } from './dto/burnout.dto';

@Controller('v1/burnout')
export class BurnoutController {
  constructor(private readonly burnoutService: BurnoutService) {}

  @Post()
  @ApiOperation({
    summary: 'Get burnout employees index',
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
  getBurnoutIndex(
    @Body() burnoutIndexDto: BurnoutIndexDto,
  ): Promise<Record<number, number>> {
    try {
      const { startDate, endDate } = burnoutIndexDto;
      // Safe check
      return this.burnoutService.getBurnoutIndex({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      // return res.status(200).json({ data: emploees });
    } catch (error) {
      return error.message;
      // return res.status(error.statusCode ?? 400).json({ error: error.message });
    }
  }
}
