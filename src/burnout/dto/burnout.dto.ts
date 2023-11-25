import { ApiProperty } from '@nestjs/swagger';
import { IsDate } from 'class-validator';

export class BurnoutIndexDto {
  @ApiProperty({
    description: 'Start Date',
    example: 'Sun Nov 26 2023 00:13:53 GMT+0300 (Москва, стандартное время)',
    required: true,
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'End Date',
    example: 'Sun Nov 26 2023 00:13:53 GMT+0300 (Москва, стандартное время)',
    required: true,
  })
  @IsDate()
  endDate: Date;
}
