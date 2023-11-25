import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import {
  differenceInDays,
  format,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns';
import { CommitMetadata, MessageMetadata, TaskMetadata } from '../types/prisma';
import { BurnoutIndexDto } from './dto/burnout.dto';
import { Employee } from '@prisma/client';

@Injectable()
export class BurnoutService {
  constructor(private readonly prisma: PrismaService) {}

  async getBurnoutIndex({
    startDate,
    endDate,
  }: BurnoutIndexDto): Promise<Record<number, Employee>> {
    const employees = await this.prisma.employee.findMany({
      include: {
        messages: true,
        commits: true,
        tasks: true,
      },
    });

    const burnoutIndices = {};

    for (const employee of employees) {
      let burnoutIndex = 0;

      // 1) Large difference between the number of messages per day with the average number of messages per day
      const daysInPeriod = differenceInDays(endDate, startDate) + 1;
      const messagesInPeriod = employee.messages.filter((message) =>
        isWithinInterval(
          new Date((message.metadata as unknown as MessageMetadata).time),
          { start: startDate, end: endDate },
        ),
      );
      const avgMessagesPerDay = messagesInPeriod.length / daysInPeriod;
      const todayMessages = messagesInPeriod.filter(
        (message) =>
          format(
            new Date((message.metadata as unknown as MessageMetadata).time),
            'yyyy-MM-dd',
          ) === format(new Date(), 'yyyy-MM-dd'),
      ).length;
      const largeMessageDifference =
        messagesInPeriod.length > 0 &&
        Math.abs(todayMessages - avgMessagesPerDay) > avgMessagesPerDay;
      if (largeMessageDifference) {
        burnoutIndex += 33; // Assign a weight of 33 to this sign
      }

      // 2) Large number of commit messages less than 10 characters long
      let weekStart = startOfWeek(startDate);
      const shortCommitMessagesByWeek = [];
      while (weekStart < endDate) {
        const weekEnd = endOfWeek(weekStart);
        const shortCommitMessagesThisWeek = employee.commits.filter(
          (commit) =>
            (commit.metadata as unknown as CommitMetadata).message.length <
              10 &&
            isWithinInterval(
              new Date((commit.metadata as unknown as CommitMetadata).time),
              { start: weekStart, end: weekEnd },
            ),
        ).length;
        shortCommitMessagesByWeek.push(shortCommitMessagesThisWeek);
        weekStart = addDays(weekEnd, 1);
      }
      const manyShortCommitMessagesByWeek = shortCommitMessagesByWeek.filter(
        (count) => count > 5,
      ).length;
      if (manyShortCommitMessagesByWeek > 3) {
        burnoutIndex += 33; // Assign a weight of 33 to this sign
      }

      // 3) Repeated transfers of a task from "backlog" status to another and back again within one day
      const tasksChangedWithinOneDay = employee.tasks.filter((task) =>
        isWithinInterval(
          new Date((task.metadata as unknown as TaskMetadata).statusChangeTime),
          { start: startDate, end: endDate },
        ),
      );
      const shuffleTransfers = tasksChangedWithinOneDay.filter(
        (task, i, tasks) =>
          i > 0 &&
          (tasks[i - 1].metadata as unknown as TaskMetadata).status ===
            'backlog' &&
          (task.metadata as unknown as TaskMetadata).status !== 'backlog',
      ).length;
      if (shuffleTransfers > 2) {
        burnoutIndex += 34; // Assign a weight of 34 to this sign
      }

      burnoutIndices[employee.id] = burnoutIndex;
    }

    return burnoutIndices;
  }
}
