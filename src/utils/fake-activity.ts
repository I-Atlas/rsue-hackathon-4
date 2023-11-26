import { faker } from '@faker-js/faker';
import { Employee, PrismaClient } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { STATUSES } from '../constants/prisma';

export interface FakeActivityProps {
  date: Date;
  employee: Employee;
  prisma: PrismaClient | PrismaService;
}

export function getRandomIntInclusive({
  min,
  max,
}: {
  min: number;
  max: number;
}) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const generageFakeActivity = async ({
  date,
  employee,
  prisma,
}: FakeActivityProps) => {
  // Generate commits
  const commitsCount = getRandomIntInclusive({ min: 2, max: 4 });
  const commits = [];
  for (let k = 0; k < commitsCount; k++) {
    commits.push({
      message: faker.git.commitMessage(),
      sha: faker.git.commitSha(),
      time: date,
      employeeId: employee.id,
    });
  }

  // Generate messages
  const messagesCount = getRandomIntInclusive({ min: 5, max: 10 });
  const messages = [];
  for (let k = 0; k < messagesCount; k++) {
    messages.push({
      length: getRandomIntInclusive({ min: 1, max: 200 }),
      angry: Math.random() < 0.1,
      time: date,
      employeeId: employee.id,
    });
  }

  // Generate tasks
  const tasksCount = getRandomIntInclusive({ min: 3, max: 5 });
  const tasks = [];
  for (let k = 0; k < tasksCount; k++) {
    tasks.push({
      time: date,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      employeeId: employee.id,
    });
  }

  const hours = getRandomIntInclusive({ min: 5, max: 8 });
  // Generate application activity
  await prisma.applicationActivity.create({
    data: {
      time: date,
      hours: hours,
      employeeId: employee.id,
    },
  });
  await prisma.commit.createMany({
    data: commits,
  });
  await prisma.message.createMany({
    data: messages,
  });
  await prisma.task.createMany({
    data: tasks,
  });
};
