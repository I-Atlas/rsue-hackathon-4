import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { differenceInDays, isWithinInterval } from 'date-fns';
import { BurnoutIndexDto } from './dto/burnout.dto';

@Injectable()
export class BurnoutService {
  private readonly logger = new Logger(BurnoutService.name);
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

      // Filter messages, commits, tasks, and application activity by startDate and endDate
      const messagesInPeriod = employee.messages.filter((message) =>
        isWithinInterval(message.time, { start: startDate, end: endDate }),
      );
      const commitsInPeriod = employee.commits.filter((commit) =>
        isWithinInterval(commit.time, { start: startDate, end: endDate }),
      );
      const tasksInPeriod = employee.tasks.filter((task) =>
        isWithinInterval(task.time, { start: startDate, end: endDate }),
      );
      const appActivityInPeriod = employee.applicationActivity.filter(
        (appActivity) =>
          isWithinInterval(appActivity.time, {
            start: startDate,
            end: endDate,
          }),
      );

      // 1) Large difference between the number of messages for an individual day and the average number of messages for the day
      const avgMessagesPerDay =
        messagesInPeriod.length / differenceInDays(endDate, startDate);
      const largeMessageDifference = messagesInPeriod.some(
        (message, i, messages) => {
          const messagesToday = messages.filter(
            (m) => differenceInDays(m.time, message.time) === 0,
          );
          return (
            Math.abs(messagesToday.length - avgMessagesPerDay) >
            avgMessagesPerDay
          );
        },
      );
      if (largeMessageDifference) {
        this.logger.debug('largeMessageDifference');
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      // 2) A large number of commit messages less than 10 characters long
      const shortCommitMessages = commitsInPeriod.filter(
        (commit) => commit.message.length < 10,
      );
      if (shortCommitMessages.length > commitsInPeriod.length / 2) {
        this.logger.debug('shortCommitMessages');
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      // 3) Repeatedly moving a task from "backlog" status to another and back again within a single day
      const shuffleTransfers = tasksInPeriod.some((task, i, tasks) => {
        if (i === 0) return false;
        return (
          tasks[i - 1].status === 'backlog' &&
          task.status !== 'backlog' &&
          differenceInDays(task.time, tasks[i - 1].time) === 0
        );
      });
      if (shuffleTransfers) {
        this.logger.debug('shuffleTransfers');
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      // 4) Application time less than 5 hours
      const lowAppActivity = appActivityInPeriod.some(
        (appActivity) => appActivity.hours < 5,
      );
      if (lowAppActivity) {
        this.logger.debug('lowAppActivity');
        burnoutIndex += 25; // Assign a weight of 25 to this sign
      }

      burnoutIndices[employee.id] = burnoutIndex;
    }

    return burnoutIndices;
  }
}
