import { describe, it, expect } from "vitest";
import { escapeHtml, buildBankAdviceHtml } from "./pdf-helpers";

describe("escapeHtml", () => {
  it("escapes & < > \" ' characters", () => {
    expect(escapeHtml('hello & <world> "test" \'yep\'')).toBe(
      "hello &amp; &lt;world&gt; &quot;test&quot; &#039;yep&#039;",
    );
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("safe string 123")).toBe("safe string 123");
  });
});

describe("buildBankAdviceHtml", () => {
  const baseData = {
    serialNo: 42,
    filePath: "/uploads/advice.pdf",
    createdByName: "Admin User",
    createdAt: "2026-06-20T10:00:00.000Z",
    adviceUuid: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("includes the serial number in the title and body", () => {
    const html = buildBankAdviceHtml(baseData);
    expect(html).toContain("#42");
    expect(html).toContain("Bank Advice");
  });

  it("handles null serial number gracefully", () => {
    const html = buildBankAdviceHtml({ ...baseData, serialNo: null });
    expect(html).toContain("N/A");
  });

  it("handles null creator gracefully", () => {
    const html = buildBankAdviceHtml({ ...baseData, createdByName: null });
    expect(html).toContain("—");
  });

  it("handles null dates gracefully", () => {
    const html = buildBankAdviceHtml({ ...baseData, createdAt: null });
    expect(html).toContain("—");
  });

  it("includes the advice UUID in the output", () => {
    const html = buildBankAdviceHtml(baseData);
    expect(html).toContain(baseData.adviceUuid);
  });

  it("renders a complete HTML document", () => {
    const html = buildBankAdviceHtml(baseData);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });
});
