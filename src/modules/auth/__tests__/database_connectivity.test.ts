import { describe, it, expect } from "vitest";

// Must start with mysql:// — the shell may have a postgres:// DATABASE_URL from Paperclip
const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mysql://");

describe("MySQL database connectivity on port 3307", () => {
  it("connects to the database and returns admin users", async () => {
    if (!isDbAvailable) return;
    const { prisma } = await import("@/lib/prisma");
    const admins = await prisma.admin.findMany({
      where: { admin_status: 10 },
      select: { admin_id: true, admin_email: true, admin_name: true },
      take: 5,
    });
    expect(admins.length).toBeGreaterThan(0);
    expect(admins[0].admin_email).toBeTruthy();
  });

  it("verifies the studenthub_prod_local database has expected tables", async () => {
    if (!isDbAvailable) return;
    const { prisma } = await import("@/lib/prisma");
    // Query information_schema to verify critical tables exist
    const tables = await prisma.$queryRawUnsafe<
      Array<{ TABLE_NAME: string }>
    >("SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE' ORDER BY TABLE_NAME",
      "studenthub_prod_local");
    const tableNames = tables.map((t) => t.TABLE_NAME);
    expect(tableNames).toContain("admin");
    expect(tableNames).toContain("candidate");
    expect(tableNames).toContain("staff");
    expect(tableNames).toContain("contact");
  });

  it("finds test admin user for login", async () => {
    if (!isDbAvailable) return;
    const { prisma } = await import("@/lib/prisma");
    const testAdmin = await prisma.admin.findFirst({
      where: { admin_email: "test@studenthub.app" },
      select: { admin_id: true, admin_name: true, admin_email: true, admin_password_hash: true },
    });
    expect(testAdmin).not.toBeNull();
    expect(testAdmin!.admin_name).toBe("Test Admin");
  });
});
