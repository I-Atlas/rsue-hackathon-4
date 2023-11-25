import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { subMonths } from 'date-fns';
import { EMPLOEES_PER_COMPANY } from '../src/constants/prisma';
import { generageFakeActivity } from '../src/utils/fake-activity';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.create({
    data: {
      name: faker.company.name(),
    },
  });
  for (let i = 0; i < EMPLOEES_PER_COMPANY; i++) {
    const startDate = subMonths(new Date(), 6);
    const endDate = subMonths(new Date(), 2);

    const employeeSex = faker.person.sexType();
    const employee = await prisma.employee.create({
      data: {
        name: faker.person.fullName({ sex: employeeSex }),
        sex: employeeSex,
        companyId: company.id,
      },
    });

    generageFakeActivity({ startDate, endDate, employee, prisma });
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
