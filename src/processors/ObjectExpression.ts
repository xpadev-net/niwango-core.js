import { A_ANY, A_ObjectExpression, T_scope } from "@/@types/ast";
import { getName } from "@/context";
import { execute } from "@/context";

/**
 * オブジェクトを作成する
 * @param script
 * @param scopes
 */
const processObjectExpression = (
  script: A_ObjectExpression,
  scopes: T_scope[],
  trace: A_ANY[]
) => {
  const object: { [key: string | number | symbol]: unknown } = {};
  for (const item of script.properties) {
    object[getName(item.key, scopes, trace) as string] = execute(
      item.value,
      scopes,
      trace
    );
  }
  return object;
};

export { processObjectExpression };
