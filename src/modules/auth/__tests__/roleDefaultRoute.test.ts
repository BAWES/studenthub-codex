import { describe, it, expect } from "vitest";
import { roleDefaultRoute } from "../types";

describe("roleDefaultRoute", () => {
  it('returns "/admin" for admin role', () => {
    expect(roleDefaultRoute("admin")).toBe("/admin");
  });

  it('returns "/staff" for staff role', () => {
    expect(roleDefaultRoute("staff")).toBe("/staff");
  });

  it('returns "/candidate" for candidate role', () => {
    expect(roleDefaultRoute("candidate")).toBe("/candidate");
  });

  it('returns "/company" for company role', () => {
    expect(roleDefaultRoute("company")).toBe("/company");
  });

  it('returns "/inspector" for inspector role', () => {
    expect(roleDefaultRoute("inspector")).toBe("/inspector");
  });
});
