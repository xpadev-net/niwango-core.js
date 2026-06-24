import { afterEach, describe, expect, test, vi } from "vitest";
import { prototypeScope } from "@/context";
import NiwangoCore from "@/main";
import { parseScript } from "@/parser/parse";

const stringifyArg = (arg: unknown) => {
  if (typeof arg === "string") {
    return arg;
  }
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
};

type ConsoleSpy = {
  mock: {
    calls: unknown[][];
  };
};

const consoleOutput = (spies: ConsoleSpy[]) =>
  spies
    .flatMap((spy) => spy.mock.calls)
    .map((args) => args.map(stringifyArg).join(" "))
    .join("\n");

const spyOnDiagnostics = () => [
  vi.spyOn(console, "info").mockImplementation(() => undefined),
  vi.spyOn(console, "log").mockImplementation(() => undefined),
  vi.spyOn(console, "error").mockImplementation(() => undefined),
  vi.spyOn(console, "debug").mockImplementation(() => undefined),
];

const executeWithSecretScope = (source: string, secret: string) => {
  const ast = parseScript(source, "diagnostic.test");
  return NiwangoCore.execute(
    ast,
    [{ secret }, { hostToken: secret }, prototypeScope],
    [ast],
  );
};

describe("diagnostic logging redaction", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("syntax recovery diagnostics omit the script text", () => {
    const secret = "SCRIPT_SECRET_PARSE";
    const spies = spyOnDiagnostics();

    expect(
      parseScript(`"${secret}"@+1`, "diagnostic.test", {
        recoverSyntaxErrors: true,
      }),
    ).toBeTruthy();

    expect(consoleOutput(spies)).not.toContain(secret);
    expect(console.info).toHaveBeenCalled();
  });

  test("caught runtime errors omit AST, scope, and trace secrets", () => {
    const secret = "RUNTIME_SCOPE_SECRET";
    const scriptSecret = "RUNTIME_SCRIPT_SECRET";
    const spies = spyOnDiagnostics();

    expect(executeWithSecretScope(`missing("${scriptSecret}")`, secret)).toBe(
      undefined,
    );

    const output = consoleOutput(spies);
    expect(output).not.toContain(secret);
    expect(output).not.toContain(scriptSecret);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[execute] NotImplementedError"),
    );
  });

  test("dump does not write argument values or trace by default", () => {
    const secret = "DUMP_SCOPE_SECRET";
    const spies = spyOnDiagnostics();

    expect(executeWithSecretScope("dump(secret)", secret)).toBe(undefined);

    expect(console.debug).not.toHaveBeenCalled();
    expect(consoleOutput(spies)).not.toContain(secret);
  });

  test("invalid at-call diagnostics omit trace and scope secrets", () => {
    const secret = "AT_TRACE_SECRET";
    const spies = spyOnDiagnostics();

    expect(executeWithSecretScope("@()", secret)).toBe(undefined);

    expect(console.error).toHaveBeenCalledWith(
      "[call expression] @: at least 1 argument required",
    );
    expect(consoleOutput(spies)).not.toContain(secret);
  });
});
