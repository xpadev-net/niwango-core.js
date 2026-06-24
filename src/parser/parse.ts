import type { A_ANY } from "@/@types/ast";

import { SyntaxError as PeggySyntaxError, parse } from "./parser";

const DEFAULT_PARSE_SCRIPT_MAX_INPUT_LENGTH = 65_536;
const DEFAULT_PARSE_SCRIPT_MAX_RECOVERY_ATTEMPTS = 16;

class ParserInputLimitError extends Error {
  readonly inputLength: number;
  readonly maxInputLength: number;

  constructor(inputLength: number, maxInputLength: number) {
    super(
      `Parser input length ${inputLength} exceeds the configured maximum of ${maxInputLength}.`,
    );
    this.name = "ParserInputLimitError";
    this.inputLength = inputLength;
    this.maxInputLength = maxInputLength;
  }
}

class ParserRecoveryLimitError extends Error {
  readonly maxRecoveryAttempts: number;

  constructor(maxRecoveryAttempts: number, cause: unknown) {
    super(
      `Parser syntax recovery stopped after ${maxRecoveryAttempts} attempt${
        maxRecoveryAttempts === 1 ? "" : "s"
      }.`,
      { cause },
    );
    this.name = "ParserRecoveryLimitError";
    this.maxRecoveryAttempts = maxRecoveryAttempts;
  }
}

/**
 * Budget controls for the synchronous parser wrapper. The generated parser is
 * synchronous, so parseScript enforces deterministic size/recovery boundaries
 * instead of an in-process wall-clock timeout.
 */
interface ParseScriptOptions {
  /** Re-enable the legacy Peggy syntax-error character deletion loop. */
  recoverSyntaxErrors?: boolean;
  /** Maximum script length passed to the generated parser. */
  maxInputLength?: number;
  /** Maximum syntax-error character deletions when recovery is enabled. */
  maxRecoveryAttempts?: number;
}

const resolveParserLimit = (
  value: number | undefined,
  defaultValue: number,
  optionName: string,
) => {
  const limit = value ?? defaultValue;
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError(`${optionName} must be a non-negative safe integer.`);
  }
  return limit;
};

const assertParserInputLength = (script: string, maxInputLength: number) => {
  if (script.length > maxInputLength) {
    throw new ParserInputLimitError(script.length, maxInputLength);
  }
};

const parseScript = (
  content: string,
  name: string,
  options: ParseScriptOptions = {},
): A_ANY => {
  const maxInputLength = resolveParserLimit(
    options.maxInputLength,
    DEFAULT_PARSE_SCRIPT_MAX_INPUT_LENGTH,
    "maxInputLength",
  );
  const maxRecoveryAttempts = resolveParserLimit(
    options.maxRecoveryAttempts,
    DEFAULT_PARSE_SCRIPT_MAX_RECOVERY_ATTEMPTS,
    "maxRecoveryAttempts",
  );
  let script = content;
  if (script.startsWith("/")) {
    script = script.slice(1);
  }
  assertParserInputLength(script, maxInputLength);
  if (!options.recoverSyntaxErrors) {
    return parse(script, { grammarSource: name });
  }
  let firstError: unknown;
  let recoveryAttempts = 0;
  for (;;) {
    try {
      return parse(script, { grammarSource: name });
    } catch (e) {
      firstError ??= e;
      if (!(e instanceof PeggySyntaxError)) {
        throw e;
      }
      if (recoveryAttempts >= maxRecoveryAttempts) {
        throw new ParserRecoveryLimitError(maxRecoveryAttempts, e);
      }
      console.info(e.format([{ source: name, text: script }]));
      const removed =
        script.slice(0, e.location.start.offset) +
        script.slice(e.location.start.offset + 1);
      if (script === removed) throw firstError;
      recoveryAttempts++;
      script = removed;
    }
  }
};

export {
  DEFAULT_PARSE_SCRIPT_MAX_INPUT_LENGTH,
  DEFAULT_PARSE_SCRIPT_MAX_RECOVERY_ATTEMPTS,
  ParserInputLimitError,
  ParserRecoveryLimitError,
  parseScript,
};
export type { ParseScriptOptions };
