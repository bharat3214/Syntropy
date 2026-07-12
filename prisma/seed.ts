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
  console.log('Seeding database...');

  // ── 1. Departments ──────────────────────────────────────────────────────────
  const deptData = [
    { name: 'Operations', code: 'OPS-01' },
    { name: 'Engineering', code: 'ENG-01' },
    { name: 'Human Resources', code: 'HR-01' },
    { name: 'Finance', code: 'FIN-01' },
    { name: 'Marketing', code: 'MKT-01' },
    { name: 'Procurement', code: 'PRO-01' },
    { name: 'Manufacturing', code: 'MNF-01' },
  ];

  const deptId: Record<string, string> = {};
  for (const d of deptData) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
    deptId[dept.name] = dept.id;
  }
  console.log('Departments created');

  // ── 2. Employees ────────────────────────────────────────────────────────────
  const employeeData = [
    { id: 'emp-001', email: 'alice@syntropy.com', firstName: 'Alice', lastName: 'Smith', dept: 'Operations' },
    { id: 'emp-002', email: 'bob@syntropy.com', firstName: 'Bob', lastName: 'Jones', dept: 'Engineering' },
    { id: 'emp-003', email: 'carol@syntropy.com', firstName: 'Carol', lastName: 'Williams', dept: 'Human Resources' },
    { id: 'emp-004', email: 'dave@syntropy.com', firstName: 'Dave', lastName: 'Brown', dept: 'Finance' },
    { id: 'emp-005', email: 'eve@syntropy.com', firstName: 'Eve', lastName: 'Davis', dept: 'Marketing' },
    { id: 'demo-employee-001', email: 'demo@syntropy.com', firstName: 'Demo', lastName: 'User', dept: 'Operations' },
  ];

  const empId: Record<string, string> = {};
  for (const emp of employeeData) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        id: emp.id,
        email: emp.email,
        firstName: emp.firstName,
        lastName: emp.lastName,
        departmentId: deptId[emp.dept],
      },
    });
    empId[emp.email] = emp.id;
  }
  console.log('Employees created');

  // ── 3. CSR Activities ───────────────────────────────────────────────────────
  const csrActivities = [
    { title: 'Tree Planting Drive', description: 'Company-wide tree planting initiative across three urban parks to offset carbon emissions and improve local biodiversity.', category: 'Environment', department: 'Operations', location: 'Green Valley Park', date: new Date('2025-06-15'), durationHours: 6, maxParticipants: 50, status: 'Active', organizer: 'Ava Patel' },
    { title: 'Community Food Bank', description: 'Volunteer at the city food bank to sort and distribute meals to underserved communities.', category: 'Community', department: 'Human Resources', location: 'Downtown Food Bank', date: new Date('2025-07-20'), durationHours: 4, maxParticipants: 30, status: 'Active', organizer: 'Liam Chen' },
    { title: 'Beach Cleanup Campaign', description: 'Organize a coastal cleanup to remove plastic waste and promote ocean conservation awareness.', category: 'Environment', department: 'Marketing', location: 'Sunrise Beach', date: new Date('2025-08-10'), durationHours: 5, maxParticipants: 40, status: 'Draft', organizer: 'Sophia Williams' },
    { title: 'Youth Coding Workshop', description: 'Free coding bootcamp for underprivileged high school students, teaching web development fundamentals.', category: 'Education', department: 'Engineering', location: 'Community Center Hall B', date: new Date('2025-05-10'), durationHours: 8, maxParticipants: 25, status: 'Completed', organizer: 'Noah Singh' },
    { title: 'Employee Health Camp', description: 'Free health checkups and wellness sessions for employees and their families.', category: 'Health', department: 'Human Resources', location: 'Office Campus - Block A', date: new Date('2025-09-05'), durationHours: 3, maxParticipants: 100, status: 'Active', organizer: 'Emma Brooks' },
  ];

  const activityIds: string[] = [];
  for (const a of csrActivities) {
    const existing = await prisma.csrActivity.findFirst({ where: { title: a.title } });
    if (existing) {
      activityIds.push(existing.id);
    } else {
      const { department: _, ...rest } = a;
      const created = await prisma.csrActivity.create({
        data: { ...rest, departmentId: deptId[a.department] },
      });
      activityIds.push(created.id);
    }
  }
  console.log('CSR Activities created');

  // ── 4. Employee Participations ──────────────────────────────────────────────
  const participationData = [
    { activityIdx: 0, employeeEmail: 'alice@syntropy.com', dept: 'Procurement', proof: 'https://storage.example.com/proof/tree-planting-liam.jpg', approvalStatus: 'Approved', pointsEarned: 50, completionDate: new Date('2025-06-15'), reviewedBy: 'Ava Patel', reviewedDate: new Date('2025-06-16') },
    { activityIdx: 0, employeeEmail: 'bob@syntropy.com', dept: 'Marketing', proof: null, approvalStatus: 'Pending', pointsEarned: 0 },
    { activityIdx: 1, employeeEmail: 'carol@syntropy.com', dept: 'Engineering', proof: 'https://storage.example.com/proof/food-bank-noah.jpg', approvalStatus: 'Approved', pointsEarned: 40, completionDate: new Date('2025-07-20'), reviewedBy: 'Liam Chen', reviewedDate: new Date('2025-07-21') },
    { activityIdx: 1, employeeEmail: 'dave@syntropy.com', dept: 'Operations', proof: 'https://storage.example.com/proof/food-bank-emma.jpg', approvalStatus: 'Rejected', pointsEarned: 0, reviewedBy: 'Liam Chen', reviewedDate: new Date('2025-07-22'), rejectionReason: 'Photo does not show participation at the event.' },
    { activityIdx: 3, employeeEmail: 'eve@syntropy.com', dept: 'Engineering', proof: 'https://storage.example.com/proof/workshop-olivia.jpg', approvalStatus: 'Approved', pointsEarned: 60, completionDate: new Date('2025-05-10'), reviewedBy: 'Noah Singh', reviewedDate: new Date('2025-05-11') },
    { activityIdx: 4, employeeEmail: 'demo@syntropy.com', dept: 'Operations', proof: null, approvalStatus: 'Pending', pointsEarned: 0 },
  ];

  for (const p of participationData) {
    const emp = employeeData.find((e) => e.email === p.employeeEmail)!;
    const where = { activityId_employeeId: { activityId: activityIds[p.activityIdx], employeeId: empId[p.employeeEmail] } };
    const existing = await prisma.employeeParticipation.findUnique({ where }).catch(() => null);
    if (!existing) {
      await prisma.employeeParticipation.create({
        data: {
          activityId: activityIds[p.activityIdx],
          employeeId: empId[p.employeeEmail],
          departmentId: deptId[p.dept] ?? deptId['Operations'],
          proof: p.proof,
          approvalStatus: p.approvalStatus as any,
          pointsEarned: p.pointsEarned,
          completionDate: p.completionDate ?? undefined,
          reviewedBy: (p as any).reviewedBy,
          reviewedDate: (p as any).reviewedDate,
          rejectionReason: (p as any).rejectionReason,
        },
      });
    }
  }
  console.log('Employee Participations created');

  // ── 5. Diversity Metrics ────────────────────────────────────────────────────
  const diversityData = [
    { dept: 'Operations', category: 'Gender', label: 'Male', value: 45, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Operations', category: 'Gender', label: 'Female', value: 30, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Operations', category: 'Gender', label: 'Non-binary', value: 5, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Gender', label: 'Male', value: 60, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Gender', label: 'Female', value: 35, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Gender', label: 'Non-binary', value: 5, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Human Resources', category: 'Gender', label: 'Male', value: 12, total: 30, period: 'Q2 2025', year: 2025 },
    { dept: 'Human Resources', category: 'Gender', label: 'Female', value: 16, total: 30, period: 'Q2 2025', year: 2025 },
    { dept: 'Human Resources', category: 'Gender', label: 'Non-binary', value: 2, total: 30, period: 'Q2 2025', year: 2025 },
    { dept: 'Operations', category: 'Age Group', label: '18-24', value: 10, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Operations', category: 'Age Group', label: '25-34', value: 30, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Operations', category: 'Age Group', label: '35-44', value: 25, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Operations', category: 'Age Group', label: '45+', value: 15, total: 80, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Ethnicity', label: 'Asian', value: 40, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Ethnicity', label: 'White', value: 30, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Ethnicity', label: 'Hispanic', value: 15, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Ethnicity', label: 'Black', value: 10, total: 100, period: 'Q2 2025', year: 2025 },
    { dept: 'Engineering', category: 'Ethnicity', label: 'Other', value: 5, total: 100, period: 'Q2 2025', year: 2025 },
  ];

  for (const dm of diversityData) {
    const existing = await prisma.diversityMetric.findFirst({
      where: { departmentId: deptId[dm.dept], category: dm.category, label: dm.label, period: dm.period },
    });
    if (!existing) {
      await prisma.diversityMetric.create({
        data: { departmentId: deptId[dm.dept], category: dm.category, label: dm.label, value: dm.value, total: dm.total, period: dm.period, year: dm.year },
      });
    }
  }
  console.log('Diversity Metrics created');

  // ── 6. Training Programs ────────────────────────────────────────────────────
  const trainingData = [
    { title: 'ESG Fundamentals', description: 'Comprehensive overview of Environmental, Social, and Governance principles, reporting frameworks, and organizational impact.', category: 'ESG Awareness', department: 'Human Resources', trainer: 'Dr. Sarah Mitchell', durationHours: 8, mandatory: true, startDate: new Date('2025-06-01'), endDate: new Date('2025-06-30'), status: 'In Progress', maxCapacity: 200 },
    { title: 'Workplace Safety Standards', description: 'OSHA compliance, hazard identification, emergency procedures, and personal protective equipment usage.', category: 'Safety', department: 'Operations', trainer: 'Mark Thompson', durationHours: 4, mandatory: true, startDate: new Date('2025-07-01'), endDate: new Date('2025-07-15'), status: 'Scheduled', maxCapacity: 80 },
    { title: 'Diversity, Equity & Inclusion', description: 'Building inclusive workplaces through understanding unconscious bias, cultural competency, and equitable practices.', category: 'DEI', department: 'Human Resources', trainer: 'Prof. Angela Davis', durationHours: 6, mandatory: false, startDate: new Date('2025-05-01'), endDate: new Date('2025-05-31'), status: 'Completed', maxCapacity: 150 },
    { title: 'ESG Compliance & Reporting', description: 'Deep dive into ESG regulatory requirements, reporting standards (GRI, SASB), and compliance best practices.', category: 'Compliance', department: 'Finance', trainer: 'Jennifer Liu', durationHours: 10, mandatory: true, startDate: new Date('2025-08-01'), endDate: new Date('2025-08-31'), status: 'Scheduled', maxCapacity: 50 },
  ];

  const trainingIds: string[] = [];
  for (const t of trainingData) {
    const existing = await prisma.trainingProgram.findFirst({ where: { title: t.title } });
    if (existing) {
      trainingIds.push(existing.id);
    } else {
      const { department: _, ...rest } = t;
      const created = await prisma.trainingProgram.create({
        data: { ...rest, departmentId: deptId[t.department] },
      });
      trainingIds.push(created.id);
    }
  }
  console.log('Training Programs created');

  // ── 7. Training Completions ─────────────────────────────────────────────────
  const completionData = [
    { trainingIdx: 0, employeeEmail: 'alice@syntropy.com', dept: 'Procurement', completionDate: new Date('2025-06-20'), score: 92, status: 'Completed', certificateUrl: 'https://certs.example.com/esg-fundamentals/EMP-001' },
    { trainingIdx: 0, employeeEmail: 'bob@syntropy.com', dept: 'Marketing', completionDate: null, score: null, status: 'In Progress' },
    { trainingIdx: 2, employeeEmail: 'carol@syntropy.com', dept: 'Engineering', completionDate: new Date('2025-05-25'), score: 88, status: 'Completed', certificateUrl: 'https://certs.example.com/dei/EMP-003' },
    { trainingIdx: 2, employeeEmail: 'dave@syntropy.com', dept: 'Operations', completionDate: new Date('2025-05-28'), score: 75, status: 'Completed', certificateUrl: 'https://certs.example.com/dei/EMP-004' },
    { trainingIdx: 0, employeeEmail: 'eve@syntropy.com', dept: 'Engineering', completionDate: null, score: null, status: 'Not Started' },
    { trainingIdx: 1, employeeEmail: 'demo@syntropy.com', dept: 'Operations', completionDate: null, score: null, status: 'Not Started' },
  ];

  for (const c of completionData) {
    const where = { trainingId_employeeId: { trainingId: trainingIds[c.trainingIdx], employeeId: empId[c.employeeEmail] } };
    const existing = await prisma.trainingCompletion.findUnique({ where }).catch(() => null);
    if (!existing) {
      await prisma.trainingCompletion.create({
        data: {
          trainingId: trainingIds[c.trainingIdx],
          employeeId: empId[c.employeeEmail],
          departmentId: deptId[c.dept] ?? deptId['Operations'],
          completionDate: c.completionDate ?? undefined,
          score: c.score ?? undefined,
          status: c.status,
          certificateUrl: c.certificateUrl ?? undefined,
        },
      });
    }
  }
  console.log('Training Completions created');

  // ── 8. Governance: Policies ─────────────────────────────────────────────────
  const policyData = [
    { title: 'Environmental Management Policy', department: 'Operations', description: 'Defines environmental stewardship and waste management procedures.', status: 'Active', version: '2.1', effectiveDate: new Date('2025-01-15') },
    { title: 'Vendor Compliance Policy', department: 'Procurement', description: 'Establishes supplier ESG disclosure requirements.', status: 'Active', version: '1.4', effectiveDate: new Date('2025-03-01') },
    { title: 'Chemical Safety Policy', department: 'Manufacturing', description: 'Standards for hazardous material handling and documentation.', status: 'Draft', version: '0.9', effectiveDate: new Date('2025-09-01') },
  ];

  const policyIds: string[] = [];
  for (const p of policyData) {
    const existing = await prisma.policy.findFirst({ where: { title: p.title } });
    if (existing) {
      policyIds.push(existing.id);
    } else {
      const { department: _, ...rest } = p;
      const created = await prisma.policy.create({
        data: { ...rest, departmentId: deptId[p.department] },
      });
      policyIds.push(created.id);
    }
  }
  console.log('Policies created');

  // ── 9. Policy Acknowledgements ──────────────────────────────────────────────
  const ackData = [
    { policyIdx: 0, employeeEmail: 'eve@syntropy.com', status: 'Acknowledged', dateSigned: new Date('2025-01-20') },
    { policyIdx: 1, employeeEmail: 'alice@syntropy.com', status: 'Pending', dateSigned: null },
    { policyIdx: 2, employeeEmail: 'bob@syntropy.com', status: 'Pending', dateSigned: null },
  ];

  for (const a of ackData) {
    const where = { policyId_employeeId: { policyId: policyIds[a.policyIdx], employeeId: empId[a.employeeEmail] } };
    const existing = await prisma.policyAcknowledgement.findUnique({ where }).catch(() => null);
    if (!existing) {
      await prisma.policyAcknowledgement.create({
        data: {
          policyId: policyIds[a.policyIdx],
          employeeId: empId[a.employeeEmail],
          status: a.status,
          dateSigned: a.dateSigned ?? undefined,
        },
      });
    }
  }
  console.log('Policy Acknowledgements created');

  // ── 10. Audits ──────────────────────────────────────────────────────────────
  const auditData = [
    { title: 'Q2 Waste Audit', department: 'Operations', auditor: 'Dave Brown', date: new Date('2025-06-12'), findings: 'Minor waste segregation inconsistencies.', status: 'Completed' },
    { title: 'Vendor Compliance Check', department: 'Procurement', auditor: 'Carol Williams', date: new Date('2025-07-02'), findings: 'Awaiting vendor disclosure verification.', status: 'Under Review' },
    { title: 'Safety Documentation Review', department: 'Manufacturing', auditor: 'Eve Davis', date: new Date('2025-08-15'), findings: 'Scheduled inspection.', status: 'Scheduled' },
  ];

  const auditIds: string[] = [];
  for (const a of auditData) {
    const existing = await prisma.audit.findFirst({ where: { title: a.title } });
    if (existing) {
      auditIds.push(existing.id);
    } else {
      const { department: _, ...rest } = a;
      const created = await prisma.audit.create({
        data: { ...rest, departmentId: deptId[a.department] },
      });
      auditIds.push(created.id);
    }
  }
  console.log('Audits created');

  // ── 11. Compliance Issues ───────────────────────────────────────────────────
  const issueData = [
    { auditIdx: 0, department: 'Manufacturing', issue: 'Missing MSDS sheets', severity: 'High', status: 'Open' },
    { auditIdx: 1, department: 'Procurement', issue: 'Late vendor disclosure', severity: 'Medium', status: 'In Progress' },
    { auditIdx: 0, department: 'Operations', issue: 'Waste container labeling', severity: 'Low', status: 'Resolved' },
  ];

  for (const i of issueData) {
    const existing = await prisma.complianceIssue.findFirst({
      where: { issue: i.issue, auditId: auditIds[i.auditIdx] },
    });
    if (!existing) {
      await prisma.complianceIssue.create({
        data: {
          auditId: auditIds[i.auditIdx],
          departmentId: deptId[i.department],
          issue: i.issue,
          severity: i.severity,
          status: i.status,
        },
      });
    }
  }
  console.log('Compliance Issues created');

  // ── 12. Gamification: Challenges ────────────────────────────────────────────
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
  console.log('Challenges created');

  // ── 13. Badges ──────────────────────────────────────────────────────────────
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
  console.log('Badges created');

  // ── 14. Rewards ─────────────────────────────────────────────────────────────
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
  console.log('Rewards created');

  // ── 15. XP Ledger ───────────────────────────────────────────────────────────
  const xpMap: Record<string, number> = {
    'emp-001': 1200,
    'emp-002': 450,
    'emp-003': 780,
    'emp-004': 220,
    'emp-005': 1650,
    'demo-employee-001': 850,
  };

  for (const [eid, amount] of Object.entries(xpMap)) {
    const existing = await prisma.xpLedger.findFirst({ where: { employeeId: eid } });
    if (!existing) {
      await prisma.xpLedger.create({
        data: { employeeId: eid, amount, reason: 'Initial seeding' },
      });
    }
  }

  const bonusXp = [
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
  console.log('XP Ledger seeded');

  // ── 16. Award Badges ────────────────────────────────────────────────────────
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

  // ── 17. Challenge Participations ────────────────────────────────────────────
  const challengesList = await prisma.challenge.findMany();
  const activeChallenges = challengesList.filter((c) => c.status === 'ACTIVE');
  const completedChallenge = challengesList.find((c) => c.status === 'COMPLETED');

  const participations = [
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
  console.log('Challenge Participations created');

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
