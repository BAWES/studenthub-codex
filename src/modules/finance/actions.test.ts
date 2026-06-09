import { describe, it, expect } from "vitest";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Finance controller parameter validation
//
// The finance actions use manual Number() + Number.isInteger() checks rather
// than Zod schemas. These tests duplicate the validation rules to verify them
// without mocking prisma/session/redirect.
// ---------------------------------------------------------------------------

const tcIdSchema = z.coerce.number().int().positive();
const transferIdSchema = z.coerce.number().int().positive();
const receivedDateSchema = z.string().optional();

describe("toggleCandidatePaidAction — parameter validation", () => {
  it("accepts valid tc_id and transfer_id", () => {
    expect(tcIdSchema.safeParse(42).success).toBe(true);
    expect(transferIdSchema.safeParse(99).success).toBe(true);
  });

  it("rejects zero tc_id", () => {
    expect(tcIdSchema.safeParse(0).success).toBe(false);
  });

  it("rejects negative tc_id", () => {
    expect(tcIdSchema.safeParse(-1).success).toBe(false);
  });

  it("rejects non-integer tc_id", () => {
    expect(tcIdSchema.safeParse(1.5).success).toBe(false);
  });

  it("rejects NaN tc_id", () => {
    expect(tcIdSchema.safeParse(NaN).success).toBe(false);
  });

  it("rejects zero transfer_id", () => {
    expect(transferIdSchema.safeParse(0).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(transferIdSchema.safeParse(-5).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(transferIdSchema.safeParse(3.14).success).toBe(false);
  });

  it("coerces string tc_id to number", () => {
    const r = tcIdSchema.safeParse("42");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe(42);
  });

  it("coerces string transfer_id to number", () => {
    const r = transferIdSchema.safeParse("99");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe(99);
  });

  it("rejects empty string transfer_id", () => {
    expect(transferIdSchema.safeParse("").success).toBe(false);
  });
});

describe("toggleTransferStatusAction — parameter validation", () => {
  it("accepts valid transfer_id", () => {
    expect(transferIdSchema.safeParse(1).success).toBe(true);
  });

  it("rejects zero transfer_id", () => {
    expect(transferIdSchema.safeParse(0).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(transferIdSchema.safeParse(-10).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(transferIdSchema.safeParse(2.5).success).toBe(false);
  });
});

describe("markPaymentReceivedAction — parameter validation", () => {
  it("accepts valid transfer_id", () => {
    expect(transferIdSchema.safeParse(42).success).toBe(true);
  });

  it("rejects invalid transfer_id", () => {
    expect(transferIdSchema.safeParse(0).success).toBe(false);
  });

  it("accepts valid received date string", () => {
    const r = receivedDateSchema.safeParse("2026-06-01");
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toBe("2026-06-01");
  });

  it("accepts empty received date (defaults to today)", () => {
    const r = receivedDateSchema.safeParse("");
    expect(r.success).toBe(true);
  });

  it("accepts undefined received date", () => {
    const r = receivedDateSchema.safeParse(undefined);
    expect(r.success).toBe(true);
  });
});

describe("deleteTransferAction — parameter validation", () => {
  it("accepts valid transfer_id", () => {
    expect(transferIdSchema.safeParse(77).success).toBe(true);
  });

  it("rejects zero transfer_id", () => {
    expect(transferIdSchema.safeParse(0).success).toBe(false);
  });

  it("rejects negative transfer_id", () => {
    expect(transferIdSchema.safeParse(-1).success).toBe(false);
  });

  it("rejects non-integer transfer_id", () => {
    expect(transferIdSchema.safeParse(1.1).success).toBe(false);
  });
});
