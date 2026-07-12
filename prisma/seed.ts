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

  // 1. Create Departments
  const deptData = [
    { name: 'Operations', code: 'OPS-01' },
    { name: 'Engineering', code: 'ENG-01' },
    { name: 'Human Resources', code: 'HR-01' },
    { name: 'Finance', code: 'FIN-01' },
    { name: 'Marketing', code: 'MKT-01' },
  ];

  const departments: Record<string, string> = {};
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
    departments[dept.name] = dept.id;
  }

  // 2. Create Employees
  const employeeData = [
    { id: 'emp-001', email: 'alice@syntropy.com', firstName: 'Alice', lastName: 'Smith', dept: 'Operations' },
    { id: 'emp-002', email: 'bob@syntropy.com', firstName: 'Bob', lastName: 'Jones', dept: 'Engineering' },
    { id: 'emp-003', email: 'carol@syntropy.com', firstName: 'Carol', lastName: 'Williams', dept: 'Human Resources' },
    { id: 'emp-004', email: 'dave@syntropy.com', firstName: 'Dave', lastName: 'Brown', dept: 'Finance' },
    { id: 'emp-005', email: 'eve@syntropy.com', firstName: 'Eve', lastName: 'Davis', dept: 'Marketing' },
    { id: 'demo-employee-001', email: 'demo@syntropy.com', firstName: 'Demo', lastName: 'User', dept: 'Operations' },
  ];

  for (const emp of employeeData) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        id: emp.id,
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        departmentId: departments[emp.dept],
      },
    });
  }

  // 3. Create Challenges
  const challenges = [
    { title: 'Zero Waste Week', description: 'Sort and recycle 100% of your office waste for a week.', xpReward: 150, status: 'ACTIVE', evidenceRequired: true, startDate: new Date(), endDate: new Date(Date.now() + 7 * 86400000) },
    { title: 'Commute Green', description: 'Use public transport or bike to work for 5 days.', xpReward: 300, status: 'ACTIVE', evidenceRequired: true, startDate: new Date(), endDate: new Date(Date.now() + 14 * 86400000) },
    { title: 'Energy Saver', description: 'Reduce your workstation energy consumption by turning off unused electronics.', xpReward: 200, status: 'ACTIVE', evidenceRequired: false, startDate: new Date(), endDate: new Date(Date.now() + 10 * 86400000) },
    { title: 'Paperless Month', description: 'Go completely paperless for one month — no printing, all digital.', xpReward: 400, status: 'UPCOMING', evidenceRequired: true, startDate: new Date(Date.now() + 30 * 86400000), endDate: new Date(Date.now() + 60 * 86400000) },
    { title: 'Plant a Tree', description: 'Plant a tree in your community and submit a photo as evidence.', xpReward: 500, status: 'ACTIVE', evidenceRequired: true, startDate: new Date(), endDate: new Date(Date.now() + 21 * 86400000) },
    { title: 'Water Conservation', description: 'Reduce personal water usage by 20% for a month.', xpReward: 250, status: 'UPCOMING', evidenceRequired: true, startDate: new Date(Date.now() + 14 * 86400000), endDate: new Date(Date.now() + 44 * 86400000) },
    { title: 'Sustainable Lunch', description: 'Bring a zero-waste lunch to work for 10 consecutive days.', xpReward: 180, status: 'ACTIVE', evidenceRequired: false, startDate: new Date(), endDate: new Date(Date.now() + 12 * 86400000) },
    { title: 'Volunteer Day', description: 'Volunteer for a local environmental cause for at least 4 hours.', xpReward: 350, status: 'COMPLETED', evidenceRequired: true, startDate: new Date(Date.now() - 30 * 86400000), endDate: new Date(Date.now() - 2 * 86400000) },
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
    { name: 'Green Commuter', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074201.png', unlockRule: { type: 'commute' } },
    { name: 'Century Club', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074225.png', unlockRule: { xp: 100 } },
    { name: 'Challenge Master', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074231.png', unlockRule: { challenges: 5 } },
    { name: 'Sustainability Star', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074240.png', unlockRule: { xp: 1000 } },
    { name: 'Tree Hugger', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074245.png', unlockRule: { xp: 250 } },
    { name: 'Waste Warrior', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074250.png', unlockRule: { challenges: 3 } },
    { name: 'Carbon Neutral', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3074/3074261.png', unlockRule: { xp: 2000 } },
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
    { itemName: 'Company Merch Pack', pointCost: 1000, stockCount: 25 },
    { itemName: 'Lunch with CEO', pointCost: 3000, stockCount: 5 },
    { itemName: 'Donation to Charity', pointCost: 1500, stockCount: 100 },
    { itemName: 'Premium Parking Spot', pointCost: 2000, stockCount: 8 },
  ];

  for (const r of rewards) {
    const existing = await prisma.reward.findFirst({ where: { itemName: r.itemName } });
    if (!existing) {
      await prisma.reward.create({ data: r });
    }
  }

  // 6. Seed XP Ledger for all employees
  const xpMap: Record<string, number> = {
    'emp-001': 1200,
    'emp-002': 450,
    'emp-003': 780,
    'emp-004': 220,
    'emp-005': 1650,
    'demo-employee-001': 850,
  };

  for (const [empId, amount] of Object.entries(xpMap)) {
    const existing = await prisma.xpLedger.findFirst({ where: { employeeId: empId } });
    if (!existing) {
      await prisma.xpLedger.create({
        data: { employeeId: empId, amount, reason: 'Initial seeding' },
      });
    }
  }

  // 7. Seed additional XP entries for variety (historical entries)
  const bonusXp: { empId: string; amount: number; reason: string }[] = [
    { empId: 'emp-001', amount: 100, reason: 'Zero Waste Week participation' },
    { empId: 'emp-003', amount: 150, reason: 'Commute Green completion' },
    { empId: 'emp-005', amount: 200, reason: 'Volunteer Day completion' },
    { empId: 'emp-005', amount: 300, reason: 'Plant a Tree completion' },
    { empId: 'demo-employee-001', amount: 150, reason: 'Zero Waste Week participation' },
  ];

  for (const b of bonusXp) {
    const existing = await prisma.xpLedger.findFirst({
      where: { employeeId: b.empId, reason: b.reason },
    });
    if (!existing) {
      await prisma.xpLedger.create({ data: { employeeId: b.empId, amount: b.amount, reason: b.reason } });
    }
  }

  // 8. Award Badges based on XP thresholds
  const allBadges = await prisma.badge.findMany();
  const allEmployees = await prisma.employee.findMany();

  for (const emp of allEmployees) {
    const xpResult = await prisma.xpLedger.aggregate({
      where: { employeeId: emp.id },
      _sum: { amount: true },
    });
    const totalXp = Number(xpResult._sum.amount ?? 0);

    for (const badge of allBadges) {
      const rule = badge.unlockRule as Record<string, number>;
      if (rule.xp && totalXp >= rule.xp) {
        const existing = await prisma.employeeBadge.findFirst({
          where: { employeeId: emp.id, badgeId: badge.id },
        });
        if (!existing) {
          await prisma.employeeBadge.create({ data: { employeeId: emp.id, badgeId: badge.id } });
          console.log(`  Awarded "${badge.name}" to ${emp.firstName} ${emp.lastName}`);
        }
      }
    }
  }

  // 9. Create Challenge Participation records
  const challengesList = await prisma.challenge.findMany();
  const activeChallenges = challengesList.filter((c) => c.status === 'ACTIVE');
  const completedChallenge = challengesList.find((c) => c.status === 'COMPLETED');

  const participations: { empId: string; challengeId: string; status: string }[] = [
    { empId: 'emp-001', challengeId: activeChallenges[0]?.id ?? '', status: 'APPROVED' },
    { empId: 'emp-001', challengeId: activeChallenges[1]?.id ?? '', status: 'PENDING' },
    { empId: 'demo-employee-001', challengeId: activeChallenges[0]?.id ?? '', status: 'PENDING' },
  ];

  if (completedChallenge) {
    participations.push(
      { empId: 'emp-005', challengeId: completedChallenge.id, status: 'APPROVED' },
      { empId: 'emp-003', challengeId: completedChallenge.id, status: 'APPROVED' },
    );
  }

  for (const p of participations) {
    if (!p.challengeId) continue;
    const existing = await prisma.challengeParticipation.findFirst({
      where: { employeeId: p.empId, challengeId: p.challengeId },
    });
    if (!existing) {
      await prisma.challengeParticipation.create({
        data: { employeeId: p.empId, challengeId: p.challengeId, status: p.status },
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
