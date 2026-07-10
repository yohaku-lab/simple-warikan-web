import { describe, expect, it } from "vitest";
import { normalizeAmountText } from "./format";

describe("normalizeAmountText", () => {
  it("passes half-width digits through unchanged", () => {
    expect(normalizeAmountText("12000")).toBe("12000");
  });

  it("converts full-width digits from a Japanese IME to half-width", () => {
    expect(normalizeAmountText("１２０００")).toBe("12000");
  });

  it("handles mixed full-width and half-width digits", () => {
    expect(normalizeAmountText("1２3４5")).toBe("12345");
  });

  it("strips non-digit characters (kana, symbols, separators)", () => {
    expect(normalizeAmountText("1,200円")).toBe("1200");
    expect(normalizeAmountText("いちまん")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeAmountText("")).toBe("");
  });
});
