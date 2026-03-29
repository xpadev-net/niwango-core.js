import type { A_ANY } from "@/@types";
import { execute } from "@/context";
import { NotImplementedError } from "@/errors";
import { parseScript } from "@/parser/parse";
import type { PrototypeStringFunction } from "@/prototype/String/index";

const processEval: PrototypeStringFunction = (
  _script,
  scopes,
  object,
  trace: A_ANY[],
) => {
  try {
    const script = parseScript(object, "[eval]");
    return execute(script, scopes, trace);
  } catch (e) {
    if (
      e instanceof NotImplementedError ||
      (e instanceof Error && e.name === "SyntaxError")
    ) {
      return undefined;
    }
    throw e;
  }
};

export { processEval };
