import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.complianceIssue.deleteMany();
  await prisma.audit.deleteMany();
  await prisma.policyAcknowledgement.deleteMany();
  await prisma.policy.deleteMany();

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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
