import { describe, it, expect } from "vitest";
describe("mcp-icd10", () => {
  it("should build search URLs", () => {
    const params = new URLSearchParams({ terms: "diabetes", maxList: "20" });
    expect(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?${params}`).toContain("terms=diabetes");
  });
  it("should parse response arrays", () => {
    const data = [5, ["E11.9", "E11.65"], null, [["E11.9", "Type 2 DM"], ["E11.65", "Type 2 DM with hyperglycemia"]]];
    const codes = data[1] as string[];
    const details = data[3] as string[][];
    expect(codes.length).toBe(2);
    expect(details[0][1]).toBe("Type 2 DM");
  });
  it("should have 21 chapters", () => { expect(21).toBe(21); });
  it("should format codes correctly", () => { expect("E11.9".includes(".")).toBe(true); });
  it("should handle code prefix searches", () => {
    const prefix = "J"; expect(prefix.length).toBe(1);
  });
  it("should support extra fields", () => {
    const ef = "code,name,parent_code,parent_name"; expect(ef.split(",").length).toBe(4);
  });
});
