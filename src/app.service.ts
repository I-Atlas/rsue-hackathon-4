import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Commit, Employee } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { generageFakeActivity } from './utils/fake-activity';
import {
  addDays,
  endOfWeek,
  isWithinInterval,
  startOfWeek,
  subDays,
  subMonths,
} from 'date-fns';
import { CommitMetadata, MessageMetadata, TaskMetadata } from './types/prisma';

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

  async getBurnoutEmployees(): Promise<Employee[]> {
    try {
      const employees = await this.prisma.employee.findMany({
        include: {
          messages: true,
          commits: true,
          tasks: true,
        },
      });

      const burnoutRiskEmploees = employees.filter((employee) => {
        // 1) Большая разница между количеством сообщений за день со средним количеством сообщений за день
        const avgMessagesPerDay = employee.messages.length / 30; // Assuming 30 days in a month
        const todayMessages = employee.messages.filter((message) =>
          new Date((message.metadata as unknown as MessageMetadata).time)
            .toISOString()
            .startsWith(new Date().toISOString().slice(0, 10)),
        ).length;
        const largeMessageDifference =
          Math.abs(todayMessages - avgMessagesPerDay) > avgMessagesPerDay;

        // 2) Большое количество сообщений коммитов длиной менее 10 символов.
        const now = new Date();
        const sixMonthsAgo = subMonths(now, 6);
        let weekStart = startOfWeek(sixMonthsAgo);

        const commitsByWeek = new Map<string, Set<Commit>>();
        while (weekStart < now) {
          const weekEnd = endOfWeek(weekStart);

          const commitsThisWeek = employee.commits.filter((commit) =>
            isWithinInterval(
              new Date((commit.metadata as unknown as CommitMetadata).time),
              { start: weekStart, end: weekEnd },
            ),
          );

          commitsByWeek.set(
            weekStart.toISOString().slice(0, 10),
            new Set(commitsThisWeek),
          );

          weekStart = addDays(weekEnd, 1);
        }

        const shortCommitMessagesByWeek = Array.from(
          commitsByWeek.values(),
        ).map((commits) => {
          const shortCommitMessagesThisWeek = Array.from(commits).filter(
            (commit) =>
              (commit.metadata as unknown as CommitMetadata).message.length <
              10,
          ).length;
          return shortCommitMessagesThisWeek;
        });

        const manyShortCommitMessagesByWeek = shortCommitMessagesByWeek.map(
          (count) => count > 10,
        );

        // 3) Многократные переводы таска из статуса "backlog" в другой и обратно в течение одного дня.
        const tasksByDate = new Map<string, typeof employee.tasks>();
        employee.tasks.forEach((task) => {
          const date = new Date(
            (task.metadata as unknown as TaskMetadata).statusChangeTime,
          )
            .toISOString()
            .slice(0, 10);
          const tasksForDate = tasksByDate.get(date) || [];
          tasksForDate.push(task);
          tasksByDate.set(date, tasksForDate);
        });

        const shuffleTransfersByDate = new Map<string, number>();
        tasksByDate.forEach((tasks, date) => {
          const shuffleTransfers = tasks.filter(
            (task, i, tasks) =>
              i > 0 &&
              (tasks[i - 1].metadata as unknown as TaskMetadata).status ===
                'backlog' &&
              (task.metadata as unknown as TaskMetadata).status !== 'backlog',
          ).length;
          shuffleTransfersByDate.set(date, shuffleTransfers);
        });

        const manyShuffleTransfersByDate = Array.from(
          shuffleTransfersByDate.values(),
        ).filter((count) => count > 2);

        return (
          largeMessageDifference ||
          manyShortCommitMessagesByWeek.length > 3 ||
          manyShuffleTransfersByDate.length > 3
        );
      });
      return burnoutRiskEmploees.map((employee) => ({
        id: employee.id,
        name: employee.name,
        sex: employee.sex,
        companyId: employee.companyId,
      }));
    } catch (error) {
      this.logger.error('Error get burnout employees', error.message);
    }
  }
}
