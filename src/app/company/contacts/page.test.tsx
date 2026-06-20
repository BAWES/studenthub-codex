import { describe, it, expect } from "vitest";
import {
  listCompanyContactsSchema,
  getCompanyContactSchema,
  createCompanyContactSchema,
  updateCompanyContactSchema,
  companyContactListItemSchema,
  listCompanyContactsResultSchema,
  companyContactDetailSchema,
  companyContactUuidResultSchema,
  companyContactRowSchema,
} from "./schemas";

/**
 * Page migration test for company/contacts.
 *
 * Verifies the data contract between page and action.
 *
 * Full rendering tests require Playwright (server component).
 */
describe("company contacts page — data contract", () => {
  it("listCompanyContactsSchema accepts valid input", () => {
    const r = listCompanyContactsSchema.safeParse({
      company_id: 1,
      page: 1,
      limit: 20,
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyContactsSchema accepts empty input", () => {
    const r = listCompanyContactsSchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("getCompanyContactSchema validates with uuid", () => {
    const r = getCompanyContactSchema.safeParse({ uuid: "contact-uuid" });
    expect(r.success).toBe(true);
  });

  it("getCompanyContactSchema rejects missing uuid", () => {
    const r = getCompanyContactSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("createCompanyContactSchema validates with required fields", () => {
    const r = createCompanyContactSchema.safeParse({
      company_id: 1,
      contact_name: "Jane Doe",
    });
    expect(r.success).toBe(true);
  });

  it("createCompanyContactSchema rejects missing company_id", () => {
    const r = createCompanyContactSchema.safeParse({
      contact_name: "Jane",
    });
    expect(r.success).toBe(false);
  });

  it("createCompanyContactSchema rejects missing contact_name", () => {
    const r = createCompanyContactSchema.safeParse({
      company_id: 1,
    });
    expect(r.success).toBe(false);
  });

  it("updateCompanyContactSchema validates with uuid", () => {
    const r = updateCompanyContactSchema.safeParse({
      uuid: "contact-uuid",
      contact_position: "Manager",
      allow_access: true,
    });
    expect(r.success).toBe(true);
  });

  it("updateCompanyContactSchema rejects missing uuid", () => {
    const r = updateCompanyContactSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it("companyContactListItemSchema validates a list item", () => {
    const r = companyContactListItemSchema.safeParse({
      company_contact_uuid: "uuid-123",
      company_id: 1,
      contact_position: "Manager",
      allow_access: true,
      contact_name: "Jane Doe",
      contact_email: "jane@acme.com",
      company_name: "Acme Corp",
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyContactsResultSchema validates paginated result", () => {
    const r = listCompanyContactsResultSchema.safeParse({
      contacts: [
        {
          company_contact_uuid: "uuid-1",
          company_id: 1,
          contact_position: "Manager",
          allow_access: true,
          contact_name: "Jane",
          contact_email: "jane@acme.com",
          company_name: "Acme",
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
  });

  it("companyContactDetailSchema validates detail (can be null)", () => {
    const r = companyContactDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("companyContactDetailSchema validates populated detail", () => {
    const r = companyContactDetailSchema.safeParse({
      company_contact_uuid: "uuid-123",
      contact_uuid: "contact-uuid",
      company_id: 1,
      contact_position: "Manager",
      allow_access: true,
      created_at: new Date(),
      updated_at: new Date(),
      contact_name: "Jane Doe",
      contact_email: "jane@acme.com",
      company_name: "Acme Corp",
    });
    expect(r.success).toBe(true);
  });

  it("companyContactUuidResultSchema validates UUID result", () => {
    const r = companyContactUuidResultSchema.safeParse({
      company_contact_uuid: "new-uuid",
    });
    expect(r.success).toBe(true);
  });

  it("companyContactRowSchema validates contact row", () => {
    const r = companyContactRowSchema.safeParse({
      id: "uuid-1",
      name: "Jane Doe",
      email: "jane@acme.com",
      position: "Manager",
      companyName: "Acme Corp",
      allowAccess: true,
    });
    expect(r.success).toBe(true);
  });
});
