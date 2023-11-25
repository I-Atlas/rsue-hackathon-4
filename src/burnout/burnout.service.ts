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
import {
  AppliacationActivityMetadata,
  CommitMetadata,
  MessageMetadata,
  TaskMetadata,
} from '../types/prisma';
import { BurnoutIndexDto } from './dto/burnout.dto';

@Injectable()
export class BurnoutService {
  constructor(private readonly prisma: PrismaService) {}

  async getBurnoutIndex({
    startDate,
    endDate,
  }: BurnoutIndexDto): Promise<Record<number, number>> {
    const employees = await this.prisma.employee.findMany({
      include: {
        messages: true,
        commits: true,
        tasks: true,
        applicationActivity: true,
      },
    });

    const burnoutIndices = {};

    for (const employee of employees) {
      let burnoutIndex = 0;

      // Filter messages, commits, and tasks by startDate and endDate
      const messagesInPeriod = employee.messages.filter((message) =>
        isWithinInterval(
          new Date((message.metadata as unknown as MessageMetadata).time),
          { start: new Date(startDate), end: new Date(endDate) },
        ),
      );
      const commitsInPeriod = employee.commits.filter((commit) =>
        isWithinInterval(
          new Date((commit.metadata as unknown as CommitMetadata).time),
          { start: new Date(startDate), end: new Date(endDate) },
        ),
      );
      const tasksInPeriod = employee.tasks.filter((task) =>
        isWithinInterval(
          new Date((task.metadata as unknown as TaskMetadata).statusChangeTime),
          { start: new Date(startDate), end: new Date(endDate) },
        ),
      );

      // 1) Large difference between the number of messages per day with the average number of messages per day
      const daysInPeriod =
        differenceInDays(new Date(endDate), new Date(startDate)) + 1;
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
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      // 2) Large number of commit messages less than 10 characters long
      let weekStart = startOfWeek(new Date(startDate));
      const shortCommitMessagesByWeek = [];
      while (weekStart < new Date(endDate)) {
        const weekEnd = endOfWeek(weekStart);
        const shortCommitMessagesThisWeek = commitsInPeriod.filter(
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
      if (manyShortCommitMessagesByWeek > 10) {
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      // 3) Repeated transfers of a task from "backlog" status to another and back again within one day
      const shuffleTransfers = tasksInPeriod.filter(
        (task, i, tasks) =>
          i > 0 &&
          (tasks[i - 1].metadata as unknown as TaskMetadata).status ===
            'backlog' &&
          (task.metadata as unknown as TaskMetadata).status !== 'backlog',
      ).length;
      if (shuffleTransfers > daysInPeriod * 5) {
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      // 4) Application time less than 4 hours per day
      const totalApplicationTime = employee.applicationActivity.reduce(
        (total, current) =>
          total +
          new Date(
            (current.metadata as unknown as AppliacationActivityMetadata).time,
          ).getTime(),
        0,
      );
      const avgApplicationTimePerDay = totalApplicationTime / daysInPeriod;
      if (avgApplicationTimePerDay < 4 * 60 * 60 * 1000) {
        // 4 hours in milliseconds
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      burnoutIndices[employee.id] = burnoutIndex;
    }

    return burnoutIndices;
  }
}
