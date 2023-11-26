import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { EMPLOEES_PER_COMPANY } from '../src/constants/prisma';
import { generageFakeActivity } from '../src/utils/fake-activity';

const prisma = new PrismaClient();

async function main() {
  // Create a company
  const company = await prisma.company.create({
    data: {
      name: faker.company.name(),
    },
  });

  // Create employees
  for (let i = 0; i < EMPLOEES_PER_COMPANY; i++) {
    const employeeSex = faker.person.sexType();
    const employee = await prisma.employee.create({
      data: {
        name: faker.person.fullName({ sex: employeeSex }),
        sex: employeeSex,
        age: faker.number.int({ min: 18, max: 60 }),
        experience: faker.number.int({ min: 0, max: 10 }),
        companyId: company.id,
      },
    });

    // Generate data for each day for 2 months back from the current date
    for (let j = 0; j < 60; j++) {
      const date = new Date();
      date.setDate(date.getDate() - j);

      generageFakeActivity({ date, employee, prisma });
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
