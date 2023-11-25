import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { subMonths } from 'date-fns';

const prisma = new PrismaClient();

const EMPLOEES_PER_COMPANY = 15;

const STATUSES = [
  'backlog',
  'in_progress',
  'in_testing',
  'in_review',
  'completed',
];

async function main() {
  const company = await prisma.company.create({
    data: {
      name: faker.company.name(),
    },
  });
  for (let i = 0; i < EMPLOEES_PER_COMPANY; i++) {
    const startDate = subMonths(new Date(), 6);
    const endDate = subMonths(new Date(), 2);

    const employee = await prisma.employee.create({
      data: {
        companyId: company.id,
      },
    });

    const hours = faker.number.int({ min: 1, max: 8 }); // Random hours between 1 and 8
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
        case 0: // High message volume
          for (let j = 0; j < 10; j++) {
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
          }
          break;
        case 1: // Shuffle statuses
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

          // Simulate multiple shuffle transfers
          const otherStatuses = STATUSES.filter(
            (status) => status !== 'backlog',
          );
          for (let i = 0; i < 2; i++) {
            // Change 5 to the number of shuffle transfers you want to simulate
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
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
