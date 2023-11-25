import { faker } from '@faker-js/faker';
import { Employee, PrismaClient } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { STATUSES } from 'src/constants/prisma';

export interface FakeActivityProps {
  startDate: Date;
  endDate: Date;
  employee: Employee;
  prisma: PrismaClient | PrismaService;
}

export const generageFakeActivity = async ({
  startDate,
  endDate,
  employee,
  prisma,
}: FakeActivityProps) => {
  const hours = faker.number.int({ min: 1, max: 8 }); // Часы работы в приложениях в день
  await prisma.applicationActivity.create({
    data: {
      metadata: {
        time: faker.date.between({ from: startDate, to: endDate }),
        hours: hours,
      },
      employeeId: employee.id,
    },
  });

  for (
    let date = startDate;
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const burnoutType = Math.floor(Math.random() * 16);
    switch (burnoutType) {
      case 0:
        for (let j = 0; j < 10; j++) {
          /**
           * Представим, что мы получаем данные о сообщениях
           * из какого-то сервиса ещеи он автоматически трекает
           * агрессивное взаимодейсвие в сообщениях.
           */
          await prisma.message.create({
            data: {
              metadata: {
                time: faker.date.between({ from: startDate, to: endDate }),
                length: faker.number.int({ min: 1, max: 200 }),
                isAngry: Math.random() < 0.1,
              },
              employeeId: employee.id,
            },
          });
        }
        break;
      case 1:
        const statusChangeTime = faker.date.between({
          from: startDate,
          to: endDate,
        });
        const task = await prisma.task.create({
          data: {
            metadata: {
              status: 'backlog',
              statusChangeTime,
            },
            employeeId: employee.id,
          },
        });

        // Симулируем переводы таска из статуса "backlog" в другой и обратно в течение одного дня.
        const otherStatuses = STATUSES.filter((status) => status !== 'backlog');
        for (let i = 0; i < 2; i++) {
          const newStatus =
            otherStatuses[Math.floor(Math.random() * otherStatuses.length)];
          await prisma.task.update({
            where: { id: task.id },
            data: {
              metadata: {
                status: newStatus,
                statusChangeTime,
              },
            },
          });

          await prisma.task.update({
            where: { id: task.id },
            data: {
              metadata: {
                status: 'backlog',
                statusChangeTime,
              },
            },
          });
        }
        break;
      case 2: // Normal behavior
      case 3: // Normal behavior
      case 4: // Normal behavior
      case 5: // Normal behavior
      case 6: // Normal behavior
      case 7: // Normal behavior
      case 8: // Normal behavior
      case 9: // Normal behavior
      case 10: // Normal behavior
      case 11: // Normal behavior
      case 12: // Normal behavior
      case 13: // Normal behavior
      case 14: // Normal behavior
      case 15: // Normal behavior
      default:
        await prisma.message.create({
          data: {
            metadata: {
              time: faker.date.between({ from: startDate, to: endDate }),
              length: faker.number.int({ min: 1, max: 200 }),
              isAngry: Math.random() < 0.1, // 10% chance of being an angry message
            },
            employeeId: employee.id,
          },
        });
        await prisma.commit.create({
          data: {
            metadata: {
              message: faker.git.commitMessage(),
              time: faker.date.between({ from: startDate, to: endDate }),
            },
            employeeId: employee.id,
          },
        });
        await prisma.task.create({
          data: {
            metadata: {
              status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
              statusChangeTime: faker.date.between({
                from: startDate,
                to: endDate,
              }),
            },
            employeeId: employee.id,
          },
        });
        break;
    }
  }
};
