import { describe, it, expect } from "vitest";
import {
  listCandidatesSchema,
  getCandidateByIdSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// listCandidatesSchema
// ---------------------------------------------------------------------------

describe("listCandidatesSchema", () => {
  it("accepts default params (empty)", () => {
    const result = listCandidatesSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts custom page and limit", () => {
    const result = listCandidatesSchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it("rejects limit over 100", () => {
    const result = listCandidatesSchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });

  it("rejects negative page", () => {
    const result = listCandidatesSchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("accepts a search query", () => {
    const result = listCandidatesSchema.safeParse({ q: "John" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("John");
    }
  });

  it("accepts status filter", () => {
    const result = listCandidatesSchema.safeParse({ status: "active" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("coerces string page to number", () => {
    const result = listCandidatesSchema.safeParse({ page: "2" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// getCandidateByIdSchema
// ---------------------------------------------------------------------------

describe("getCandidateByIdSchema", () => {
  it("accepts a valid candidate ID", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("accepts a string candidate ID (coerced)", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: "42" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.candidateId).toBe(42);
    }
  });

  it("rejects missing candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-positive candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative candidateId", () => {
    const result = getCandidateByIdSchema.safeParse({ candidateId: -5 });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Return type shape tests
// ---------------------------------------------------------------------------

type CandidateRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: number;
  createdAt: string;
};

type CandidateDetail = {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  phone: string | null;
  gender: number | null;
  objective: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
};

type ListCandidatesResult = {
  items: CandidateRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

describe("CandidateRow shape", () => {
  it("defines the expected fields", () => {
    const mock: CandidateRow = {
      id: 42,
      name: "John Doe",
      email: "john@example.com",
      phone: "+965****1234",
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
    };
    expect(mock.id).toBe(42);
    expect(mock.name).toBe("John Doe");
    expect(mock.email).toBe("john@example.com");
  });
});

describe("CandidateDetail shape", () => {
  it("defines the expected fields", () => {
    const mock: CandidateDetail = {
      id: 42,
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+965****1234",
      gender: 1,
      objective: "Looking for a software engineering role",
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
      updatedAt: "2025-06-01T12:00:00.000Z",
    };
    expect(mock.id).toBe(42);
    expect(mock.name).toBe("John Doe");
    expect(mock.nameAr).toBe("جون دو");
  });
});

describe("ListCandidatesResult shape", () => {
  it("defines the expected structure", () => {
    const result: ListCandidatesResult = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Output schema tests
// ---------------------------------------------------------------------------

import {
  candidateRowOutputSchema,
  candidateListOutputSchema,
  candidateDetailOutputSchema,
} from "./schemas";

describe("candidateRowOutputSchema", () => {
  it("accepts a valid candidate row", () => {
    const row = {
      id: 42,
      name: "John Doe",
      email: "john@example.com",
      phone: "+965****1234",
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
    };
    expect(candidateRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("accepts null phone", () => {
    const row = {
      id: 42,
      name: "John Doe",
      email: "john@example.com",
      phone: null,
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
    };
    expect(candidateRowOutputSchema.safeParse(row).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    expect(candidateRowOutputSchema.safeParse({}).success).toBe(false);
  });

  it("rejects non-number id", () => {
    const row = {
      id: "abc",
      name: "John Doe",
      email: "john@example.com",
      phone: null,
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
    };
    expect(candidateRowOutputSchema.safeParse(row).success).toBe(false);
  });
});

describe("candidateListOutputSchema", () => {
  const validItem = {
    id: 42,
    name: "John Doe",
    email: "john@example.com",
    phone: null,
    status: 10,
    createdAt: "2025-01-10T00:00:00.000Z",
  };

  it("accepts a valid list result", () => {
    const result = {
      items: [validItem],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
    expect(candidateListOutputSchema.safeParse(result).success).toBe(true);
  });

  it("accepts empty items", () => {
    const result = {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(candidateListOutputSchema.safeParse(result).success).toBe(true);
  });

  it("rejects negative total", () => {
    const result = {
      items: [],
      total: -1,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    expect(candidateListOutputSchema.safeParse(result).success).toBe(false);
  });
});

describe("candidateDetailOutputSchema", () => {
  it("accepts a valid candidate detail", () => {
    const detail = {
      id: 42,
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: "+965****1234",
      gender: 1,
      objective: "Looking for a software engineering role",
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
      updatedAt: "2025-06-01T12:00:00.000Z",
    };
    expect(candidateDetailOutputSchema.safeParse(detail).success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const detail = {
      id: 42,
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: null,
      gender: null,
      objective: null,
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
      updatedAt: "2025-06-01T12:00:00.000Z",
    };
    expect(candidateDetailOutputSchema.safeParse(detail).success).toBe(true);
  });

  it("rejects missing updatedAt", () => {
    const detail = {
      id: 42,
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: null,
      gender: null,
      objective: null,
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
    };
    expect(candidateDetailOutputSchema.safeParse(detail).success).toBe(false);
  });

  it("rejects non-number id", () => {
    const detail = {
      id: "abc",
      name: "John Doe",
      nameAr: "جون دو",
      email: "john@example.com",
      phone: null,
      gender: null,
      objective: null,
      status: 10,
      createdAt: "2025-01-10T00:00:00.000Z",
      updatedAt: "2025-06-01T12:00:00.000Z",
    };
    expect(candidateDetailOutputSchema.safeParse(detail).success).toBe(false);
  });
});
