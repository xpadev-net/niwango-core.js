import type { A_ANY } from "@/@types/ast";

import { SyntaxError as PeggySyntaxError, parse } from "./parser";

interface ParseScriptOptions {
  /** Re-enable the legacy Peggy syntax-error character deletion loop. */
  recoverSyntaxErrors?: boolean;
}

const parseScript = (
  content: string,
  name: string,
  options: ParseScriptOptions = {},
): A_ANY => {
  let script = content;
  if (script.startsWith("/")) {
    script = script.slice(1);
  }
  if (!options.recoverSyntaxErrors) {
    return parse(script, { grammarSource: name });
  }
  let firstError: unknown;
  for (let i = 0; i < 1000; i++) {
    try {
      return parse(script, { grammarSource: name });
    } catch (e) {
      firstError ??= e;
      if (!(e instanceof PeggySyntaxError)) {
        throw e;
      }
      console.info(e.format([{ source: name, text: script }]));
      const removed =
        script.slice(0, e.location.start.offset) +
        script.slice(e.location.start.offset + 1);
      if (script === removed) throw firstError;
      script = removed;
    }
  }
  throw firstError;
};

export { parseScript };
export type { ParseScriptOptions };
