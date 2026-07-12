import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Check your .env file.');
}
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with Gamification data...');

  // 1. Create a demo Department
  const dept = await prisma.department.upsert({
    where: { name: 'Operations' },
    update: {},
    create: {
      name: 'Operations',
      code: 'OPS-01',
    },
  });

  // 2. Create demo Employees
  const employees = [
    { id: 'emp-001', email: 'alice@syntropy.com', firstName: 'Alice', lastName: 'Smith' },
    { id: 'emp-002', email: 'bob@syntropy.com', firstName: 'Bob', lastName: 'Jones' },
    { id: 'demo-employee-001', email: 'demo@syntropy.com', firstName: 'Demo', lastName: 'User' },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        id: emp.id,
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        departmentId: dept.id,
      },
    });
  }

  // 3. Create demo Challenges
  const challenges = [
    {
      title: 'Zero Waste Week',
      description: 'Sort and recycle 100% of your office waste for a week.',
      xpReward: 150,
      status: 'ACTIVE',
      evidenceRequired: true,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    {
      title: 'Commute Green',
      description: 'Use public transport or bike to work for 5 days.',
      xpReward: 300,
      status: 'ACTIVE',
      evidenceRequired: true,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
    }
  ];

  for (const c of challenges) {
    const existing = await prisma.challenge.findFirst({ where: { title: c.title } });
    if (!existing) {
      await prisma.challenge.create({ data: c });
    }
  }

  // 4. Create Badges
  const badges = [
    { name: 'Eco Pioneer', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074211.png', unlockRule: { xp: 500 } },
    { name: 'Green Commuter', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074201.png', unlockRule: { type: 'commute' } }
  ];

  for (const b of badges) {
    const existing = await prisma.badge.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.badge.create({ data: b });
    }
  }

  // 5. Create Rewards
  const rewards = [
    { itemName: 'Extra Vacation Day', pointCost: 5000, stockCount: 10 },
    { itemName: 'Reusable Coffee Cup', pointCost: 500, stockCount: 50 },
  ];

  for (const r of rewards) {
    const existing = await prisma.reward.findFirst({ where: { itemName: r.itemName } });
    if (!existing) {
      await prisma.reward.create({ data: r });
    }
  }

  // 6. Give Demo User some XP and Badges so Leaderboard works
  const demoEmp = employees[2];
  const demoXp = await prisma.xpLedger.findFirst({ where: { employeeId: demoEmp.id } });
  if (!demoXp) {
    await prisma.xpLedger.create({
      data: {
        employeeId: demoEmp.id,
        amount: 850,
        reason: 'Initial Seeding',
      }
    });
  }

  const badge = await prisma.badge.findFirst({ where: { name: 'Eco Pioneer' } });
  if (badge) {
    const empBadge = await prisma.employeeBadge.findFirst({
      where: { employeeId: demoEmp.id, badgeId: badge.id }
    });
    if (!empBadge) {
      await prisma.employeeBadge.create({
        data: {
          employeeId: demoEmp.id,
          badgeId: badge.id,
        }
      });
    }
  }

  console.log('Gamification seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });