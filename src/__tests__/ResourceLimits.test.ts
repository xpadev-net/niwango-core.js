import { afterEach, describe, expect, test } from "vitest";
import { config, initConfig } from "@/config";
import { ResourceLimitError, TooMuchRecursionError } from "@/errors";
import { run } from "@/testUtils";

describe("resource limits", () => {
  afterEach(() => {
    initConfig();
  });

  test("function while_kari allows the configured iteration limit", () => {
    config.resourceLimits.loopIterations = 3;

    expect(run("i=0;while_kari(i<3,i++);i")).toBe(3);
  });

  test("function while_kari throws just above the configured iteration limit", () => {
    config.resourceLimits.loopIterations = 3;

    expect(() => run("i=0;while_kari(i<4,i++);i")).toThrow(ResourceLimitError);
  });

  test("prototype while_kari allows the configured iteration limit", () => {
    config.resourceLimits.loopIterations = 3;

    expect(run("i=0;true.while_kari(i<3,i++);i")).toBe(3);
  });

  test("prototype while_kari throws just above the configured iteration limit", () => {
    config.resourceLimits.loopIterations = 3;

    expect(() => run("i=0;true.while_kari(i<4,i++);i")).toThrow(
      ResourceLimitError,
    );
  });

  test("Number.times allows the configured iteration limit", () => {
    config.resourceLimits.timesIterations = 3;

    expect(run("i=0;3.times(i++);i")).toBe(3);
  });

  test("Number.times throws just above the configured iteration limit", () => {
    config.resourceLimits.timesIterations = 3;

    expect(() => run("i=0;4.times(i++);i")).toThrow(ResourceLimitError);
  });

  test("string multiplication allows the configured repeat boundary", () => {
    config.resourceLimits.stringRepeatCount = 3;
    config.resourceLimits.stringRepeatLength = 3;

    expect(run("'x' * 3")).toBe("xxx");
  });

  test("string multiplication throws just above the configured repeat count", () => {
    config.resourceLimits.stringRepeatCount = 3;

    expect(() => run("'x' * 4")).toThrow(ResourceLimitError);
  });

  test("string multiplication throws just above the configured repeat size", () => {
    config.resourceLimits.stringRepeatLength = 3;

    expect(() => run("'xx'.multiply(2)")).toThrow(ResourceLimitError);
  });

  test("recursion limit throws even when legacy catch mode is enabled", () => {
    config.resourceLimits.recursionDepth = 20;

    expect(() => run("def(f(), f()); f()", { catch: true })).toThrow(
      TooMuchRecursionError,
    );
  });

  test("legacy recursionLimit zero keeps recursion checking disabled", () => {
    config.recursionLimit = 0;

    expect(run("def(f(), 1); f()")).toBe(1);
  });
});
