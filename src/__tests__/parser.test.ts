import { expect, test, vi } from "vitest";
import {
  ParserInputLimitError,
  ParserRecoveryLimitError,
  parseScript,
} from "@/parser/parse";
import { SyntaxError as PeggySyntaxError, parse } from "@/parser/parser";

test("parseScript rejects oversized script input before parsing", () => {
  const script = "1+2";

  expect(() =>
    parseScript(script, "parser.test", { maxInputLength: script.length - 1 }),
  ).toThrow(ParserInputLimitError);
});

test("parseScript parses valid input at the configured size limit", () => {
  const script = "1+2";

  expect(
    parseScript(script, "parser.test", { maxInputLength: script.length }),
  ).toEqual(parse(script, { grammarSource: "parser.test" }));
});

test("parseScript surfaces syntax errors by default", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  try {
    expect(() => parseScript("1@+2", "parser.test")).toThrow(PeggySyntaxError);
    expect(info).not.toHaveBeenCalled();
  } finally {
    info.mockRestore();
  }
});

test("parseScript recovery stops at the configured recovery count", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  try {
    expect(() =>
      parseScript("1@@+2", "parser.test", {
        recoverSyntaxErrors: true,
        maxRecoveryAttempts: 1,
      }),
    ).toThrow(ParserRecoveryLimitError);
    expect(info).toHaveBeenCalledTimes(1);
  } finally {
    info.mockRestore();
  }
});

test("parseScript recovery with zero attempts surfaces syntax errors", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  try {
    expect(() =>
      parseScript("1@+2", "parser.test", {
        recoverSyntaxErrors: true,
        maxRecoveryAttempts: 0,
      }),
    ).toThrow(PeggySyntaxError);
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
