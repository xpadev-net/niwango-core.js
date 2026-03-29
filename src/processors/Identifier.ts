import type { A_ANY, A_Identifier, T_scope } from "@/@types/ast";
import { execute } from "@/context";
import { NotImplementedError } from "@/errors/NotImplementedError";
import { processCallExpression } from "@/processors/CallExpression";
import typeGuard from "@/typeGuard";
import { resolve } from "@/utils";

/**
 * Identifierから実際の値を取得する
 * @param script
 * @param scopes
 */
const processIdentifier = (
  script: A_Identifier,
  scopes: T_scope[],
  trace: A_ANY[],
): unknown => {
  const value = resolve(script, scopes, trace);
  if (typeGuard.definedFunction(value)) {
    return execute(value.script.arguments[1], [{}, ...scopes], trace);
  }
  if (value === undefined) {
    try {
      return processCallExpression(
        {
          type: "CallExpression",
          callee: script,
          arguments: [],
        },
        scopes,
        trace,
      );
    } catch (e) {
      if (e instanceof NotImplementedError) {
        return value;
      }
      throw e;
    }
  }
  return value;
};

export { processIdentifier };
