import { describe, expect, test, vi } from "vitest";
import { run } from "@/testUtils";

describe("LogicalExpression", () => {
  test("does not evaluate right side when && short-circuits", () => {
    expect(run("i=0;false&&(i=1);i")).toBe(0);
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(run("false&&notImplemented()")).toBe(false);
      expect(consoleLog).not.toHaveBeenCalled();
    } finally {
      consoleLog.mockRestore();
    }
  });

  test("does not evaluate right side when || short-circuits", () => {
    expect(run("i=0;true||(i=1);i")).toBe(0);
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      expect(run("true||notImplemented()")).toBe(true);
      expect(consoleLog).not.toHaveBeenCalled();
    } finally {
      consoleLog.mockRestore();
    }
  });

  test("evaluates right side when && does not short-circuit", () => {
    expect(run("i=0;true&&(i=1);i")).toBe(1);
  });

  test("evaluates right side when || does not short-circuit", () => {
    expect(run("i=0;false||(i=1);i")).toBe(1);
  });
});
