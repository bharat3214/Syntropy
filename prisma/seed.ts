import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { seedEnvironmental } from "./seed-environmental";


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policy.deleteMany();

  await prisma.trainingCompletion.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.diversityMetric.deleteMany();
  await prisma.employeeParticipation.deleteMany();
  await prisma.csrActivity.deleteMany();

  console.log("🧹 Cleaned existing data");

  // ─── CSR Activities ──────────────────────────────────────────────────────────

  const treePlanting = await prisma.csrActivity.create({
    data: {
      title: "Tree Planting Drive",
      description:
        "Company-wide tree planting initiative across three urban parks to offset carbon emissions and improve local biodiversity.",
      category: "Environment",
      department: "Operations",
      location: "Green Valley Park",
      date: new Date("2025-06-15"),
      durationHours: 6,
      maxParticipants: 50,
      status: "Active",
      organizer: "Ava Patel",
    },
  });

  const foodBank = await prisma.csrActivity.create({
    data: {
      title: "Community Food Bank",
      description:
        "Volunteer at the city food bank to sort and distribute meals to underserved communities.",
      category: "Community",
      department: "HR",
      location: "Downtown Food Bank",
      date: new Date("2025-07-20"),
      durationHours: 4,
      maxParticipants: 30,
      status: "Active",
      organizer: "Liam Chen",
    },
  });

  const beachCleanup = await prisma.csrActivity.create({
    data: {
      title: "Beach Cleanup Campaign",
      description:
        "Organize a coastal cleanup to remove plastic waste and promote ocean conservation awareness.",
      category: "Environment",
      department: "Marketing",
      location: "Sunrise Beach",
      date: new Date("2025-08-10"),
      durationHours: 5,
      maxParticipants: 40,
      status: "Draft",
      organizer: "Sophia Williams",
    },
  });

  const codingWorkshop = await prisma.csrActivity.create({
    data: {
      title: "Youth Coding Workshop",
      description:
        "Free coding bootcamp for underprivileged high school students, teaching web development fundamentals.",
      category: "Education",
      department: "Engineering",
      location: "Community Center Hall B",
      date: new Date("2025-05-10"),
      durationHours: 8,
      maxParticipants: 25,
      status: "Completed",
      organizer: "Noah Singh",
    },
  });

  const healthCamp = await prisma.csrActivity.create({
    data: {
      title: "Employee Health Camp",
      description:
        "Free health checkups and wellness sessions for employees and their families.",
      category: "Health",
      department: "HR",
      location: "Office Campus - Block A",
      date: new Date("2025-09-05"),
      durationHours: 3,
      maxParticipants: 100,
      status: "Active",
      organizer: "Emma Brooks",
    },
  });

  console.log("🌿 Created 5 CSR Activities");

  // ─── Employee Participation ──────────────────────────────────────────────────

  await prisma.employeeParticipation.createMany({
    data: [
      {
        activityId: treePlanting.id,
        employeeName: "Liam Chen",
        employeeId: "EMP-001",
        department: "Procurement",
        proof: "https://storage.example.com/proof/tree-planting-liam.jpg",
        approvalStatus: "Approved",
        pointsEarned: 50,
        completionDate: new Date("2025-06-15"),
        reviewedBy: "Ava Patel",
        reviewedDate: new Date("2025-06-16"),
      },
      {
        activityId: treePlanting.id,
        employeeName: "Sophia Williams",
        employeeId: "EMP-002",
        department: "Marketing",
        proof: null,
        approvalStatus: "Pending",
        pointsEarned: 0,
      },
      {
        activityId: foodBank.id,
        employeeName: "Noah Singh",
        employeeId: "EMP-003",
        department: "Engineering",
        proof: "https://storage.example.com/proof/food-bank-noah.jpg",
        approvalStatus: "Approved",
        pointsEarned: 40,
        completionDate: new Date("2025-07-20"),
        reviewedBy: "Liam Chen",
        reviewedDate: new Date("2025-07-21"),
      },
      {
        activityId: foodBank.id,
        employeeName: "Emma Brooks",
        employeeId: "EMP-004",
        department: "Operations",
        proof: "https://storage.example.com/proof/food-bank-emma.jpg",
        approvalStatus: "Rejected",
        pointsEarned: 0,
        reviewedBy: "Liam Chen",
        reviewedDate: new Date("2025-07-22"),
        rejectionReason: "Photo does not show participation at the event.",
      },
      {
        activityId: codingWorkshop.id,
        employeeName: "Olivia Carter",
        employeeId: "EMP-005",
        department: "Engineering",
        proof: "https://storage.example.com/proof/workshop-olivia.jpg",
        approvalStatus: "Approved",
        pointsEarned: 60,
        completionDate: new Date("2025-05-10"),
        reviewedBy: "Noah Singh",
        reviewedDate: new Date("2025-05-11"),
      },
      {
        activityId: healthCamp.id,
        employeeName: "Ava Patel",
        employeeId: "EMP-006",
        department: "Operations",
        proof: null,
        approvalStatus: "Pending",
        pointsEarned: 0,
      },
    ],
  });

  console.log("👥 Created 6 Employee Participations");

  // ─── Diversity Metrics ───────────────────────────────────────────────────────

  await prisma.diversityMetric.createMany({
    data: [
      // Gender - Operations
      { department: "Operations", category: "Gender", label: "Male", value: 45, total: 80, period: "Q2 2025", year: 2025 },
      { department: "Operations", category: "Gender", label: "Female", value: 30, total: 80, period: "Q2 2025", year: 2025 },
      { department: "Operations", category: "Gender", label: "Non-binary", value: 5, total: 80, period: "Q2 2025", year: 2025 },
      // Gender - Engineering
      { department: "Engineering", category: "Gender", label: "Male", value: 60, total: 100, period: "Q2 2025", year: 2025 },
      { department: "Engineering", category: "Gender", label: "Female", value: 35, total: 100, period: "Q2 2025", year: 2025 },
      { department: "Engineering", category: "Gender", label: "Non-binary", value: 5, total: 100, period: "Q2 2025", year: 2025 },
      // Gender - HR
      { department: "HR", category: "Gender", label: "Male", value: 12, total: 30, period: "Q2 2025", year: 2025 },
      { department: "HR", category: "Gender", label: "Female", value: 16, total: 30, period: "Q2 2025", year: 2025 },
      { department: "HR", category: "Gender", label: "Non-binary", value: 2, total: 30, period: "Q2 2025", year: 2025 },
      // Age Group - Operations
      { department: "Operations", category: "Age Group", label: "18-24", value: 10, total: 80, period: "Q2 2025", year: 2025 },
      { department: "Operations", category: "Age Group", label: "25-34", value: 30, total: 80, period: "Q2 2025", year: 2025 },
      { department: "Operations", category: "Age Group", label: "35-44", value: 25, total: 80, period: "Q2 2025", year: 2025 },
      { department: "Operations", category: "Age Group", label: "45+", value: 15, total: 80, period: "Q2 2025", year: 2025 },
      // Ethnicity - Engineering
      { department: "Engineering", category: "Ethnicity", label: "Asian", value: 40, total: 100, period: "Q2 2025", year: 2025 },
      { department: "Engineering", category: "Ethnicity", label: "White", value: 30, total: 100, period: "Q2 2025", year: 2025 },
      { department: "Engineering", category: "Ethnicity", label: "Hispanic", value: 15, total: 100, period: "Q2 2025", year: 2025 },
      { department: "Engineering", category: "Ethnicity", label: "Black", value: 10, total: 100, period: "Q2 2025", year: 2025 },
      { department: "Engineering", category: "Ethnicity", label: "Other", value: 5, total: 100, period: "Q2 2025", year: 2025 },
    ],
  });

  console.log("📊 Created 18 Diversity Metrics");

  // ─── Training Programs ───────────────────────────────────────────────────────

  const esgTraining = await prisma.trainingProgram.create({
    data: {
      title: "ESG Fundamentals",
      description:
        "Comprehensive overview of Environmental, Social, and Governance principles, reporting frameworks, and organizational impact.",
      category: "ESG Awareness",
      department: "All",
      trainer: "Dr. Sarah Mitchell",
      durationHours: 8,
      mandatory: true,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-30"),
      status: "In Progress",
      maxCapacity: 200,
    },
  });

  const safetyTraining = await prisma.trainingProgram.create({
    data: {
      title: "Workplace Safety Standards",
      description:
        "OSHA compliance, hazard identification, emergency procedures, and personal protective equipment usage.",
      category: "Safety",
      department: "Operations",
      trainer: "Mark Thompson",
      durationHours: 4,
      mandatory: true,
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-07-15"),
      status: "Scheduled",
      maxCapacity: 80,
    },
  });

  const deiTraining = await prisma.trainingProgram.create({
    data: {
      title: "Diversity, Equity & Inclusion",
      description:
        "Building inclusive workplaces through understanding unconscious bias, cultural competency, and equitable practices.",
      category: "DEI",
      department: "All",
      trainer: "Prof. Angela Davis",
      durationHours: 6,
      mandatory: false,
      startDate: new Date("2025-05-01"),
      endDate: new Date("2025-05-31"),
      status: "Completed",
      maxCapacity: 150,
    },
  });

  const complianceTraining = await prisma.trainingProgram.create({
    data: {
      title: "ESG Compliance & Reporting",
      description:
        "Deep dive into ESG regulatory requirements, reporting standards (GRI, SASB), and compliance best practices.",
      category: "Compliance",
      department: "Finance",
      trainer: "Jennifer Liu",
      durationHours: 10,
      mandatory: true,
      startDate: new Date("2025-08-01"),
      endDate: new Date("2025-08-31"),
      status: "Scheduled",
      maxCapacity: 50,
    },
  });

  console.log("📚 Created 4 Training Programs");

  // ─── Training Completions ────────────────────────────────────────────────────

  await prisma.trainingCompletion.createMany({
    data: [
      {
        trainingId: esgTraining.id,
        employeeName: "Liam Chen",
        employeeId: "EMP-001",
        department: "Procurement",
        completionDate: new Date("2025-06-20"),
        score: 92,
        status: "Completed",
        certificateUrl: "https://certs.example.com/esg-fundamentals/EMP-001",
      },
      {
        trainingId: esgTraining.id,
        employeeName: "Sophia Williams",
        employeeId: "EMP-002",
        department: "Marketing",
        completionDate: null,
        score: null,
        status: "In Progress",
      },
      {
        trainingId: deiTraining.id,
        employeeName: "Noah Singh",
        employeeId: "EMP-003",
        department: "Engineering",
        completionDate: new Date("2025-05-25"),
        score: 88,
        status: "Completed",
        certificateUrl: "https://certs.example.com/dei/EMP-003",
      },
      {
        trainingId: deiTraining.id,
        employeeName: "Emma Brooks",
        employeeId: "EMP-004",
        department: "Operations",
        completionDate: new Date("2025-05-28"),
        score: 75,
        status: "Completed",
        certificateUrl: "https://certs.example.com/dei/EMP-004",
      },
      {
        trainingId: esgTraining.id,
        employeeName: "Olivia Carter",
        employeeId: "EMP-005",
        department: "Engineering",
        completionDate: null,
        score: null,
        status: "Not Started",
      },
      {
        trainingId: safetyTraining.id,
        employeeName: "Ava Patel",
        employeeId: "EMP-006",
        department: "Operations",
        completionDate: null,
        score: null,
        status: "Not Started",
      },
    ],
  });

  console.log("✅ Created 6 Training Completions");

  // ─── Governance Module ────────────────────────────────────────────────────────

  await prisma.policy.createMany({
    data: [
      {
        id: "POL-001",
        title: "Environmental Management Policy",
        department: "Operations",
        description: "Defines environmental stewardship and waste management procedures.",
        status: "Active",
        version: "2.1",
        effectiveDate: "2025-01-15"
      },
      {
        id: "POL-002",
        title: "Vendor Compliance Policy",
        department: "Procurement",
        description: "Establishes supplier ESG disclosure requirements.",
        status: "Active",
        version: "1.4",
        effectiveDate: "2025-03-01"
      },
      {
        id: "POL-003",
        title: "Chemical Safety Policy",
        department: "Manufacturing",
        description: "Standards for hazardous material handling and documentation.",
        status: "Draft",
        version: "0.9",
        effectiveDate: "2025-09-01"
      }
    ]
  });

  await prisma.policyAcknowledgement.createMany({
    data: [
      {
        id: "ACK-001",
        policyId: "POL-001",
        employeeName: "Ava Patel",
        department: "Operations",
        status: "Acknowledged",
        dateSigned: "2025-01-20"
      },
      {
        id: "ACK-002",
        policyId: "POL-002",
        employeeName: "Liam Chen",
        department: "Procurement",
        status: "Pending",
        dateSigned: null
      },
      {
        id: "ACK-003",
        policyId: "POL-003",
        employeeName: "Sophia Williams",
        department: "Manufacturing",
        status: "Pending",
        dateSigned: null
      }
    ]
  });

  await prisma.audit.createMany({
    data: [
      {
        id: "AUD-001",
        title: "Q2 Waste Audit",
        department: "Operations",
        auditor: "Emma Brooks",
        date: "2025-06-12",
        findings: "Minor waste segregation inconsistencies.",
        status: "Completed"
      },
      {
        id: "AUD-002",
        title: "Vendor Compliance Check",
        department: "Procurement",
        auditor: "Noah Singh",
        date: "2025-07-02",
        findings: "Awaiting vendor disclosure verification.",
        status: "Under Review"
      },
      {
        id: "AUD-003",
        title: "Safety Documentation Review",
        department: "Manufacturing",
        auditor: "Olivia Carter",
        date: "2025-08-15",
        findings: "Scheduled inspection.",
        status: "Scheduled"
      }
    ]
  });

  await prisma.complianceIssue.createMany({
    data: [
      {
        id: "CMP-001",
        auditId: "AUD-001",
        issue: "Missing MSDS sheets",
        severity: "High",
        department: "Manufacturing",
        status: "Open"
      },
      {
        id: "CMP-002",
        auditId: "AUD-002",
        issue: "Late vendor disclosure",
        severity: "Medium",
        department: "Procurement",
        status: "In Progress"
      },
      {
        id: "CMP-003",
        auditId: "AUD-001",
        issue: "Waste container labeling",
        severity: "Low",
        department: "Operations",
        status: "Resolved"
      }
    ]
  });

  console.log("⚖️ Created Governance Policies and Audits");

  await seedEnvironmental(prisma);

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
