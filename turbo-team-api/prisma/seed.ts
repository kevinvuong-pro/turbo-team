import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DaySeed = {
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  covers: number;
};

const currentWeek: DaySeed[] = [
  { posRevenue: 1800, eatclubRevenue: 350, labourCosts: 650, covers: 120 },
  { posRevenue: 1850, eatclubRevenue: 370, labourCosts: 680, covers: 125 },
  { posRevenue: 1900, eatclubRevenue: 350, labourCosts: 850, covers: 130 },
  { posRevenue: 1850, eatclubRevenue: 380, labourCosts: 680, covers: 120 },
  { posRevenue: 1950, eatclubRevenue: 400, labourCosts: 700, covers: 125 },
  { posRevenue: 2200, eatclubRevenue: 650, labourCosts: 800, covers: 160 },
  { posRevenue: 2500, eatclubRevenue: 427, labourCosts: 1200, covers: 170 },
];

const previousWeek: DaySeed[] = [
  { posRevenue: 1600, eatclubRevenue: 280, labourCosts: 540, covers: 105 },
  { posRevenue: 1700, eatclubRevenue: 420, labourCosts: 620, covers: 118 },
  { posRevenue: 1650, eatclubRevenue: 250, labourCosts: 750, covers: 110 },
  { posRevenue: 1580, eatclubRevenue: 260, labourCosts: 520, covers: 102 },
  { posRevenue: 1680, eatclubRevenue: 340, labourCosts: 580, covers: 112 },
  { posRevenue: 1900, eatclubRevenue: 560, labourCosts: 760, covers: 140 },
  { posRevenue: 2100, eatclubRevenue: 662, labourCosts: 1180, covers: 133 },
];

function getMondayOfWeek(reference = new Date()) {
  const date = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + diffToMonday);

  return date;
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);

  return next;
}

async function seedWeek(monday: Date, days: DaySeed[]) {
  await Promise.all(
    days.map((day, index) => {
      const date = addUtcDays(monday, index);

      return prisma.dailyRevenue.upsert({
        where: { date },
        create: { date, ...day },
        update: { ...day },
      });
    }),
  );
}

async function main() {
  const currentMonday = getMondayOfWeek();
  const previousMonday = addUtcDays(currentMonday, -7);

  await seedWeek(previousMonday, previousWeek);
  await seedWeek(currentMonday, currentWeek);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
