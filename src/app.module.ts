import { Logger, Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule, loggingMiddleware } from 'nestjs-prisma';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import { ConfigModule } from '@nestjs/config';
import { BurnoutModule } from './burnout/burnout.module';

@Module({
  imports: [
    HealthModule,
    BurnoutModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [
          loggingMiddleware({
            logger: new Logger('PrismaMiddleware'),
            logLevel: 'log',
          }),
        ],
      },
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
