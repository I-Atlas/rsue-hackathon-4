import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { describe, expect, it, beforeEach } from 'vitest';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return burnout employees array', async () => {
      const burnoutEmployees = await appController.getBurnoutEmployees();
      console.table(burnoutEmployees);
      expect(burnoutEmployees.length).toBeGreaterThan(0);
    });
  });
});
