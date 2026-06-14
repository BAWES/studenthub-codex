import { describe, it, expect } from "vitest";
import {
  companyContactListItemSchema,
  listCompanyContactsResultSchema,
  companyContactDetailSchema,
  companyContactUuidResultSchema,
  companyContactRowSchema,
} from "./schemas";

describe("company contacts page — data contract", () => {
  it("companyContactListItemSchema validates a valid contact list item", () => {
    const r = companyContactListItemSchema.safeParse({
      company_contact_uuid: "cc-123",
      company_id: 1,
      contact_position: "Manager",
      allow_access: true,
      contact_name: "John Doe",
      contact_email: "john@example.com",
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.contact_name).toBe("John Doe");
  });

  it("companyContactListItemSchema rejects missing company_contact_uuid", () => {
    const r = companyContactListItemSchema.safeParse({ contact_name: "John" });
    expect(r.success).toBe(false);
  });

  it("companyContactListItemSchema accepts null values", () => {
    const r = companyContactListItemSchema.safeParse({
      company_contact_uuid: "cc-123",
      company_id: null,
      contact_position: null,
      allow_access: null,
      contact_name: null,
      contact_email: null,
      company_name: null,
    });
    expect(r.success).toBe(true);
  });

  it("listCompanyContactsResultSchema validates a paginated result", () => {
    const r = listCompanyContactsResultSchema.safeParse({
      contacts: [
        {
          company_contact_uuid: "cc-1", company_id: null,
          contact_position: null, allow_access: null,
          contact_name: null, contact_email: null, company_name: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.contacts.length).toBe(1);
  });

  it("listCompanyContactsResultSchema rejects non-array contacts", () => {
    const r = listCompanyContactsResultSchema.safeParse({
      contacts: "bad",
      total: 0, page: 0, limit: 0, totalPages: 0,
    });
    expect(r.success).toBe(false);
  });

  it("companyContactDetailSchema validates a contact detail", () => {
    const r = companyContactDetailSchema.safeParse({
      company_contact_uuid: "cc-123",
      contact_uuid: "cu-456",
      company_id: 1,
      contact_position: "Manager",
      allow_access: true,
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-06-01"),
      contact_name: "John Doe",
      contact_email: "john@example.com",
      company_name: "Tech Corp",
    });
    expect(r.success).toBe(true);
  });

  it("companyContactDetailSchema accepts null", () => {
    const r = companyContactDetailSchema.safeParse(null);
    expect(r.success).toBe(true);
  });

  it("companyContactUuidResultSchema validates a result with UUID", () => {
    const r = companyContactUuidResultSchema.safeParse({
      company_contact_uuid: "cc-123",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.company_contact_uuid).toBe("cc-123");
  });

  it("companyContactRowSchema validates a valid row", () => {
    const r = companyContactRowSchema.safeParse({
      id: "cc-1",
      name: "John Doe",
      email: "john@example.com",
      position: "Manager",
      companyName: "Tech Corp",
      allowAccess: true,
    });
    expect(r.success).toBe(true);
  });

  it("companyContactRowSchema rejects missing id", () => {
    const r = companyContactRowSchema.safeParse({ name: "John" });
    expect(r.success).toBe(false);
  });
});
