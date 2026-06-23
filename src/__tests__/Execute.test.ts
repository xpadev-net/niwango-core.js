import { afterEach, describe, expect, test, vi } from "vitest";
import { config } from "@/config";
import { appendResultHook, initResultHook } from "@/context";
import { InvalidTypeError, NotImplementedError } from "@/errors";
import { TooMuchRecursionError } from "@/errors/TooMuchRecursionError";
import { run } from "@/testUtils";

describe("execute runtime error propagation", () => {
  afterEach(() => {
    config.recursionLimit = undefined;
    initResultHook();
    vi.restoreAllMocks();
  });

  test("throws NotImplementedError by default", () => {
    expect(() => run("missing()")).toThrow(NotImplementedError);
  });

  test("throws NotImplementedError from sequence expressions", () => {
    expect(() => run("(0, missing())")).toThrow(NotImplementedError);
  });

  test("throws NotImplementedError from defined function bodies", () => {
    expect(() => run("def(f(), missing()); f()")).toThrow(NotImplementedError);
  });

  test("keeps legacy catch behavior explicit", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    expect(run("missing()", { catch: true })).toBeUndefined();
    expect(log).toHaveBeenCalled();
  });

  test("applies result hooks when legacy catch behavior is explicit", () => {
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    appendResultHook(() => "caught");

    expect(run("missing()", { catch: true })).toBe("caught");
  });

  test("throws InvalidTypeError by default", () => {
    expect(() => run("(1).lessThan()")).toThrow(InvalidTypeError);
  });

  test("throws InvalidTypeError from sequence expressions", () => {
    expect(() => run("(0, (1).lessThan())")).toThrow(InvalidTypeError);
  });

  test("throws InvalidTypeError from defined function bodies", () => {
    expect(() => run("def(f(), (1).lessThan()); f()")).toThrow(
      InvalidTypeError,
    );
  });

  test("throws TooMuchRecursionError by default", () => {
    config.recursionLimit = 20;

    expect(() => run("def(f(), f()); f()")).toThrow(TooMuchRecursionError);
  });

  test("throws TooMuchRecursionError from sequence expressions", () => {
    config.recursionLimit = 20;

    expect(() => run("def(f(), f()); (0, f())")).toThrow(TooMuchRecursionError);
  });

  test("throws TooMuchRecursionError from defined function bodies", () => {
    config.recursionLimit = 20;

    expect(() => run("def(f(), f()); def(g(), f()); g()")).toThrow(
      TooMuchRecursionError,
    );
  });
});
