import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { BurnoutController } from './burnout.controller';
import { BurnoutService } from './burnout.service';

describe('BurnoutController', () => {
  let burnoutController: BurnoutController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BurnoutController],
      providers: [BurnoutService],
    }).compile();

    burnoutController = app.get<BurnoutController>(BurnoutController);
  });

  describe('root', () => {
    it('should return burnout employees array', async () => {
      const burnoutEmployees = await burnoutController.getBurnoutIndex({
        startDate: new Date(),
        endDate: new Date(),
      });
      console.table(burnoutEmployees);
      expect(burnoutEmployees).toBeGreaterThan(0);
    });
  });
});
