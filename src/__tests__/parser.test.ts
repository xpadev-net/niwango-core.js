import { expect, test, vi } from "vitest";
import { parseScript } from "@/parser/parse";
import { SyntaxError as PeggySyntaxError, parse } from "@/parser/parser";

test("parseScript surfaces syntax errors by default", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  try {
    expect(() => parseScript("1@+2", "parser.test")).toThrow(PeggySyntaxError);
    expect(info).not.toHaveBeenCalled();
  } finally {
    info.mockRestore();
  }
});

test("parseScript character deletion recovery is opt-in", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  try {
    expect(
      parseScript("1@+2", "parser.test", { recoverSyntaxErrors: true }),
    ).toEqual(parse("1+2", { grammarSource: "parser.test" }));
    // Removing the trailing + leaves a bare numeric literal, which is still not
    // a complete Niwango statement, so recovery should rethrow the first error.
    expect(() =>
      parseScript("1+", "parser.test", { recoverSyntaxErrors: true }),
    ).toThrow(PeggySyntaxError);
  } finally {
    info.mockRestore();
  }
});
