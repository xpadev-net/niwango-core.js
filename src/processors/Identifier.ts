import { A_Identifier, T_scope } from "@/@types/ast";
import { execute } from "@/context";
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
  scopes: T_scope[]
): unknown => {
  const value = resolve(script, scopes);
  if (typeGuard.definedFunction(value)) {
    return execute(value.script.arguments[1], [{}, ...scopes]);
  }
  if (value === undefined) {
    try {
      return processCallExpression(
        {
          type: "CallExpression",
          callee: script,
          arguments: [],
        },
        scopes
      );
    } catch (_) {
      //ignore
    }
  }
  return value;
};

export { processIdentifier };
