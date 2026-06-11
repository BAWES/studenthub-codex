import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  employeeItemSchema,
  employeeDetailSchema,
  listEmployeesResultSchema,
  createEmployeeResultSchema,
  updateEmployeeResultSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Schema definitions (test-time copy for unit isolation)
// ---------------------------------------------------------------------------

const listEmployeesSchema = z.object({
  name: z.string().optional(),
  status: z.coerce.number().int().optional(),
  departmentUuid: z.string().optional(),
  designationUuid: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const getEmployeeSchema = z.object({
  employeeUuid: z.string().min(1, "Employee UUID is required"),
});

const createEmployeeSchema = z.object({
  employeeName: z
    .string({ required_error: "Employee name is required" })
    .min(1, "Employee name is required")
    .max(255),
  employeeEmail: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .max(255),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional().default(10),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  employeeUuid: z.string().min(1, "Employee UUID is required"),
  employeeName: z.string().min(1).max(255).optional(),
  employeeEmail: z.string().email().max(255).optional(),
  employeePhone: z.string().max(45).optional(),
  employeeSalary: z.coerce.number().positive().optional(),
  employeeStatus: z.coerce.number().int().optional(),
  designationUuid: z.string().optional(),
  departmentUuid: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types (matching expected return shapes)
// ---------------------------------------------------------------------------

type EmployeeItem = {
  employee_uuid: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string | null;
  employee_salary: number | null;
  employee_status: number;
  employee_created_at: Date;
  employee_updated_at: Date;
  designation_uuid: string | null;
  department_uuid: string | null;
};

type ListEmployeesResult = {
  employees: EmployeeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type EmployeeDetail = EmployeeItem | null;

// ---------------------------------------------------------------------------
// Schema tests: listEmployees
// ---------------------------------------------------------------------------

describe("listEmployeesSchema", () => {
  it("accepts empty params (defaults)", () => {
    const result = listEmployeesSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.name).toBeUndefined();
  });

  it("accepts pagination params", () => {
    const result = listEmployeesSchema.parse({ page: "2", limit: "10" });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
  });

  it("accepts filter params", () => {
    const result = listEmployeesSchema.parse({
      name: "John",
      status: "10",
      departmentUuid: "dept-1",
    });
    expect(result.name).toBe("John");
    expect(result.status).toBe(10);
    expect(result.departmentUuid).toBe("dept-1");
  });

  it("rejects negative page", () => {
    expect(() => listEmployeesSchema.parse({ page: "-1" })).toThrow();
  });

  it("rejects limit above 100", () => {
    expect(() => listEmployeesSchema.parse({ limit: "200" })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Schema tests: getEmployee
// ---------------------------------------------------------------------------

describe("getEmployeeSchema", () => {
  it("accepts valid UUID", () => {
    const result = getEmployeeSchema.parse({ employeeUuid: "abc-123" });
    expect(result.employeeUuid).toBe("abc-123");
  });

  it("rejects empty UUID", () => {
    expect(() => getEmployeeSchema.parse({ employeeUuid: "" })).toThrow(
      "Employee UUID is required",
    );
  });
});

// ---------------------------------------------------------------------------
// Schema tests: createEmployee
// ---------------------------------------------------------------------------

describe("createEmployeeSchema", () => {
  it("accepts valid input with required fields only", () => {
    const result = createEmployeeSchema.parse({
      employeeName: "John Doe",
      employeeEmail: "john@example.com",
    });
    expect(result.employeeName).toBe("John Doe");
    expect(result.employeeEmail).toBe("john@example.com");
    expect(result.employeeStatus).toBe(10);
  });

  it("accepts valid input with all fields", () => {
    const result = createEmployeeSchema.parse({
      employeeName: "Jane Doe",
      employeeEmail: "jane@example.com",
      employeePhone: "+96550000000",
      employeeSalary: "1500.000",
      employeeStatus: "10",
      designationUuid: "des-1",
      departmentUuid: "dep-1",
    });
    expect(result.employeeName).toBe("Jane Doe");
    expect(result.employeeSalary).toBe(1500);
    expect(result.designationUuid).toBe("des-1");
  });

  it("rejects missing name", () => {
    expect(() =>
      createEmployeeSchema.parse({ employeeEmail: "test@test.com" }),
    ).toThrow("Employee name is required");
  });

  it("rejects missing email", () => {
    expect(() =>
      createEmployeeSchema.parse({ employeeName: "Test" }),
    ).toThrow();
  });

  it("rejects invalid email format", () => {
    expect(() =>
      createEmployeeSchema.parse({
        employeeName: "Test",
        employeeEmail: "not-an-email",
      }),
    ).toThrow("Invalid email format");
  });
});

// ---------------------------------------------------------------------------
// Schema tests: updateEmployee
// ---------------------------------------------------------------------------

describe("updateEmployeeSchema", () => {
  it("accepts valid UUID with partial fields", () => {
    const result = updateEmployeeSchema.parse({
      employeeUuid: "emp-1",
      employeeName: "Updated Name",
    });
    expect(result.employeeUuid).toBe("emp-1");
    expect(result.employeeName).toBe("Updated Name");
  });

  it("rejects empty employeeUuid", () => {
    expect(() =>
      updateEmployeeSchema.parse({ employeeUuid: "" }),
    ).toThrow("Employee UUID is required");
  });

  it("accepts empty optional fields", () => {
    const result = updateEmployeeSchema.parse({
      employeeUuid: "emp-1",
    });
    expect(result.employeeUuid).toBe("emp-1");
    expect(result.employeeName).toBeUndefined();
    expect(result.employeeStatus).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Type shape tests
// ---------------------------------------------------------------------------

describe("EmployeeItem type", () => {
  it("can represent a valid employee record", () => {
    const item: EmployeeItem = {
      employee_uuid: "emp-1",
      employee_name: "John Doe",
      employee_email: "john@example.com",
      employee_phone: "+96550000000",
      employee_salary: 1500,
      employee_status: 10,
      employee_created_at: new Date("2026-06-09"),
      employee_updated_at: new Date("2026-06-09"),
      designation_uuid: "des-1",
      department_uuid: "dep-1",
    };
    expect(item.employee_uuid).toBe("emp-1");
    expect(item.employee_status).toBe(10);
  });

  it("allows nullable fields as null", () => {
    const item: EmployeeItem = {
      employee_uuid: "emp-2",
      employee_name: "Jane Doe",
      employee_email: "jane@example.com",
      employee_phone: null,
      employee_salary: null,
      employee_status: 10,
      employee_created_at: new Date(),
      employee_updated_at: new Date(),
      designation_uuid: null,
      department_uuid: null,
    };
    expect(item.employee_phone).toBeNull();
    expect(item.employee_salary).toBeNull();
  });
});

describe("ListEmployeesResult type", () => {
  it("can represent an empty list", () => {
    const result: ListEmployeesResult = {
      employees: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.employees.length).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("can represent a non-empty list", () => {
    const result: ListEmployeesResult = {
      employees: [
        {
          employee_uuid: "emp-1",
          employee_name: "John",
          employee_email: "john@example.com",
          employee_phone: null,
          employee_salary: null,
          employee_status: 10,
          employee_created_at: new Date(),
          employee_updated_at: new Date(),
          designation_uuid: null,
          department_uuid: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(result.employees.length).toBe(1);
    expect(result.totalPages).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: employeeItemSchema
// ---------------------------------------------------------------------------

describe("employeeItemSchema", () => {
  const validItem = {
    employee_uuid: "emp-1",
    employee_name: "John Doe",
    employee_email: "john@example.com",
    employee_phone: "+965****0000",
    employee_salary: 1500,
    employee_status: 10,
    employee_created_at: new Date("2026-06-09"),
    employee_updated_at: new Date("2026-06-09"),
    designation_uuid: "des-1",
    department_uuid: "dep-1",
  };

  it("accepts a valid employee item", () => {
    const result = employeeItemSchema.parse(validItem);
    expect(result.employee_uuid).toBe("emp-1");
  });

  it("accepts nullable fields as null", () => {
    const result = employeeItemSchema.parse({
      ...validItem,
      employee_phone: null,
      employee_salary: null,
      designation_uuid: null,
      department_uuid: null,
    });
    expect(result.employee_phone).toBeNull();
    expect(result.employee_salary).toBeNull();
  });

  it("rejects missing required string field", () => {
    const { employee_name, ...rest } = validItem;
    expect(() => employeeItemSchema.parse(rest)).toThrow();
  });

  it("rejects wrong type for numeric field", () => {
    expect(() =>
      employeeItemSchema.parse({ ...validItem, employee_status: "not-a-number" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: employeeDetailSchema
// ---------------------------------------------------------------------------

describe("employeeDetailSchema", () => {
  it("accepts a valid employee item", () => {
    const result = employeeDetailSchema.parse({
      employee_uuid: "emp-1",
      employee_name: "John Doe",
      employee_email: "john@example.com",
      employee_phone: null,
      employee_salary: null,
      employee_status: 10,
      employee_created_at: new Date(),
      employee_updated_at: new Date(),
      designation_uuid: null,
      department_uuid: null,
    });
    expect(result).not.toBeNull();
  });

  it("accepts null", () => {
    const result = employeeDetailSchema.parse(null);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: listEmployeesResultSchema
// ---------------------------------------------------------------------------

describe("listEmployeesResultSchema", () => {
  it("accepts a valid result with employees", () => {
    const result = listEmployeesResultSchema.parse({
      employees: [
        {
          employee_uuid: "emp-1",
          employee_name: "John",
          employee_email: "john@example.com",
          employee_phone: null,
          employee_salary: null,
          employee_status: 10,
          employee_created_at: new Date(),
          employee_updated_at: new Date(),
          designation_uuid: null,
          department_uuid: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(result.employees.length).toBe(1);
  });

  it("accepts an empty list", () => {
    const result = listEmployeesResultSchema.parse({
      employees: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(result.employees.length).toBe(0);
  });

  it("rejects negative page", () => {
    expect(() =>
      listEmployeesResultSchema.parse({
        employees: [],
        total: 0,
        page: -1,
        limit: 20,
        totalPages: 0,
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: createEmployeeResultSchema
// ---------------------------------------------------------------------------

describe("createEmployeeResultSchema", () => {
  it("accepts a valid result", () => {
    const result = createEmployeeResultSchema.parse({
      employee_uuid: "emp-new-1",
    });
    expect(result.employee_uuid).toBe("emp-new-1");
  });

  it("rejects missing uuid", () => {
    expect(() => createEmployeeResultSchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Output schema tests: updateEmployeeResultSchema
// ---------------------------------------------------------------------------

describe("updateEmployeeResultSchema", () => {
  it("accepts a valid result", () => {
    const result = updateEmployeeResultSchema.parse({
      employee_uuid: "emp-updated-1",
    });
    expect(result.employee_uuid).toBe("emp-updated-1");
  });

  it("rejects missing uuid", () => {
    expect(() => updateEmployeeResultSchema.parse({})).toThrow();
  });
});
