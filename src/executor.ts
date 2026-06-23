import type { A_ANY, T_scope } from "@/@types/ast";
import type { Execute } from "@/@types/execute";
import { config } from "@/config";
import { resultHook, setExecute } from "@/context";
import { TooMuchRecursionError } from "@/errors/TooMuchRecursionError";
import { processors } from "@/processors";
import typeGuard from "@/typeGuard";

/**
 * ASTを実行する関数
 * @param script
 * @param scopes
 * @param trace
 * @param options
 */
const execute: Execute = (
  script: unknown,
  scopes: T_scope[],
  trace: A_ANY[],
  options: Partial<{ catch: boolean }> = {},
): unknown => {
  if (!script || !typeGuard.AST(script)) return;
  if (config.recursionLimit && trace.length > config.recursionLimit) {
    throw new TooMuchRecursionError(script, scopes);
  }
  let result: unknown;
  trace = [...trace, script];
  try {
    const processor = processors[script.type];
    if (processor) {
      result = processor(script, scopes, trace);
    }
  } catch (e) {
    if (!options.catch) throw e;
    console.log(e);
    console.log("trace", trace);
  }
  for (const hook of resultHook) {
    result = hook(result);
  }
  return result;
};

const initExecute = () => {
  setExecute(execute);
};

export { initExecute };
