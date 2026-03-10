import { describe, it, expect } from "vitest";
import { insertProspectSchema } from "./schema";

describe("insertProspectSchema – targetSalary validation", () => {
  const base = {
    companyName: "Acme",
    roleTitle: "Engineer",
    status: "Bookmarked" as const,
    interestLevel: "Medium" as const,
  };

  it("accepts a formatted salary string like '$80,000'", () => {
    const result = insertProspectSchema.safeParse({ ...base, targetSalary: "$80,000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.targetSalary).toBe("$80,000");
  });

  it("accepts a plain numeric string like '80000'", () => {
    const result = insertProspectSchema.safeParse({ ...base, targetSalary: "80000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.targetSalary).toBe("80000");
  });

  it("accepts an empty string", () => {
    const result = insertProspectSchema.safeParse({ ...base, targetSalary: "" });
    expect(result.success).toBe(true);
  });

  it("accepts null", () => {
    const result = insertProspectSchema.safeParse({ ...base, targetSalary: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.targetSalary).toBeNull();
  });

  it("accepts undefined (field omitted)", () => {
    const result = insertProspectSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("accepts salary with range format '$80,000 - $100,000'", () => {
    const result = insertProspectSchema.safeParse({ ...base, targetSalary: "$80,000 - $100,000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.targetSalary).toBe("$80,000 - $100,000");
  });

  it("rejects non-string values (number)", () => {
    const result = insertProspectSchema.safeParse({ ...base, targetSalary: 80000 });
    expect(result.success).toBe(false);
  });
});
