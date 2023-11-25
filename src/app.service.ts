import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { generageFakeActivity } from './utils/fake-activity';
import { subDays } from 'date-fns';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 * * *') // Крон джоба будет выполняться в 00:00 каждый день
  async cronGenerateFakeActivity() {
    try {
      this.logger.debug('Started adding activity to employees');

      const startDate = subDays(new Date(), 1);
      const endDate = new Date();
      const employees = await this.prisma.employee.findMany();
      for (const employee of employees) {
        generageFakeActivity({
          startDate,
          endDate,
          employee,
          prisma: this.prisma,
        });
      }

      this.logger.debug('Finished adding activity to employees');
    } catch (error) {
      this.logger.error('Error adding activity to employees', error.message);
    }
  }
}
