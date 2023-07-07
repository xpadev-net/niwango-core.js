import { A_ANY } from "@/@types";
import { definedFunction } from "@/@types/function";
import { execute } from "@/context";
import { PrototypeObjectFunction } from "@/prototype/Object/index";

/**
 * @関数
 * 関数定義用関数
 * @param script
 * @param scopes
 * @param object
 */
const processDefKari: PrototypeObjectFunction = (
  script,
  scopes,
  object,
  trace: A_ANY[]
) => {
  if (!script.arguments[0]) {
    return;
  }
  const functionName = execute(script.arguments[0], scopes, trace);
  if (typeof functionName !== "string") {
    return;
  }
  object[functionName] = {
    type: "definedFunction",
    isKari: true,
    script,
  } as definedFunction;
};

export { processDefKari };
